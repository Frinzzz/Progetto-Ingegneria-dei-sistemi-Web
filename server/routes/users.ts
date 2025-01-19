import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import multer, { StorageEngine } from 'multer';
import User from '../models/User'; 
import Movie from '../models/Movie'; 
import Review from '../models/Review'; 

const router = express.Router();
const fs = require('fs');

interface Session {
  userId: string;
}

interface AuthenticatedRequest extends Request {
  session: Session;
}

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Accesso non autorizzato. Effettua il login." });
  }
  next();
};

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function): void => {
    const avatarsPath = path.resolve(__dirname, "../avatars/");
    console.log("Salvataggio avatar in:", avatarsPath);
    cb(null, avatarsPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function): void => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log("Nome file generato:", uniqueName);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.use("/avatars", express.static(path.join(__dirname, "../avatars")));

router.get("/profile", isAuthenticated, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato." });
    }
    const avatarUrl = user.avatar
      ? `${req.protocol}://${req.get("host")}${user.avatar}`
      : null;

    res.status(200).json({
      avatar: avatarUrl,
      username: user.username,
      bio: user.bio,
      email: user.email,
      favorites: user.favorites,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Errore nel recupero del profilo utente:", error);
    res.status(500).json({ error: "Errore nel recupero del profilo utente." });
  }
});

router.put("/profile", isAuthenticated, upload.single("avatar"), async (req: AuthenticatedRequest & { file?: Express.Multer.File }, res: Response): Promise<void> => {
  try {
    const userId = req.session.userId;
    const { bio }: { bio?: string } = req.body;
    const avatarPath = req.file ? `/avatars/${req.file.filename}` : null;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato." });
    }

    if (bio) user.bio = bio;
    if (avatarPath) user.avatar = avatarPath;
    
    await user.save();

    res.status(200).json({
      message: "Profilo aggiornato con successo.",
      user: {
        avatar: `${req.protocol}://${req.get("host")}${user.avatar}`,
        username: user.username,
        bio:user.bio,
        email:user.email,
        favorites:user.favorites,
      },
   });
  } catch (error) {
     console.error("Errore durante l'aggiornamento del profilo:", error);
     res.status(500).json({ error:"Errore durante l'aggiornamento del profilo."});
   }
});

router.get("/favorites", isAuthenticated ,async(req : AuthenticatedRequest,res : Response):Promise<void>=>{
try{
   const userId=req.session.userId; 
   const user=await User.findById(userId).populate("favorites"); 
   
   if(!user){
       return res.status(404).json({error:"Utente non trovato."});
   }

   res.status(200).json({favorites:user.favorites});
}catch(error){
   console.error("Errore durante il recupero dei preferiti:",error); 
   res.status(500).json({error:"Errore durante il recupero dei preferiti."});
}
});

router.post("/favorites/:movieId", isAuthenticated ,async(req : AuthenticatedRequest,res : Response):Promise<void>=>{
try{
   const { movieId }: { movieId:string }= req.params; 
   const user=await User.findById(req.session.userId); 
   
   if(!user){
       return res.status(404).json({error:"Utente non trovato."});
   }

   const movie=await Movie.findById(movieId); 
   
   if(!movie){
       return res.status(404).json({error:"Film non trovato."});
   }

if(user.favorites.includes(movieId)){
       return res.status(400).json({error:"Film già presente nei preferiti."});
}

user.favorites.push(movieId); 
await user.save();

res.status(200).json({message:"Film aggiunto ai preferiti",favorites:user.favorites});  
}catch(error){
console.error("Errore nell'aggiunta del film ai preferiti:",error); 
res.status(500).json({error:"Errore nell'aggiunta del film ai preferiti."});  
}
});

router.delete("/account",isAuthenticated ,async(req : AuthenticatedRequest,res : Response):Promise<void>=>{
try{
const userId=req.session.userId; 

// Elimina l'utente
const user=await User.findByIdAndDelete(userId); 

if(!user){
return res.status(404).json({error:"Utente non trovato."});  
}

// Elimina le recensioni associate all'utente
await Review.deleteMany({user:userId});

// Invalida la sessione
req.session.destroy((err:any)=>{
if(err){
console.error("Errore durante la distruzione della sessione:",err);  
}  
});

res.status(200).json({message:"Account eliminato con successo."});  
}catch(error){
console.error("Errore durante l'eliminazione dell'account:",error);  
res.status(500).json({error:"Errore durante l'eliminazione dell'account."});  
}
});


export default router;