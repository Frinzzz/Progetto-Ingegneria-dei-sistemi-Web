import express, { Request, Response, Router } from 'express';
import Movie from '../models/Movie';
import User from '../models/User';
import Review from '../models/Review';
import path from 'path';
import fs from 'fs';
import multer, { StorageEngine } from 'multer';

const router: Router = Router();

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const moviesPath: string = path.resolve(__dirname, "../Movies/");
    console.log("Salvataggio film in:", moviesPath);
    cb(null, moviesPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName: string = `${Date.now()}-${file.originalname}`;
    console.log("Nome file generato:", uniqueName);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.use("/Movies", express.static(path.join(__dirname, "../Movies")));

router.post('/add', upload.single('movie'), async (req: Request, res: Response): Promise<void> => {
  try {
      const { title, description, category, poster }: { title: string; description: string; category: string; poster?: string } = req.body;
      const movieFileName: string = req.file.filename;
      
      const newMovie = new Movie({
          title,
          description,
          category,
          poster,
          fileName: movieFileName,
      });

      await newMovie.save();
      res.status(201).json({ message: 'Film aggiunto con successo!' });
  } catch (error) {
      console.error('Errore durante l\'aggiunta del film:', error);
      res.status(500).json({ error: 'Errore durante l\'aggiunta del film' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero dei film' });
    }
});

router.get('/featured', async (req: Request, res: Response): Promise<void> => {
    try {
        const featuredMovies = await Movie.find();
        res.json(featuredMovies);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero dei film in evidenza' });
    }
});

router.get('/search', async (req: Request, res: Response): Promise<void> => {
    try {
      const { title }: { title?: string } = req.query;
      if (!title) {
        return res.status(400).json({ error: "Titolo non fornito." });
      }

      const movies = await Movie.find({ title: { $regex:title , $options:'i' } });
      res.status(200).json(movies);
    } catch (error) {
      console.error('Errore durante la ricerca dei film:', error);
      res.status(500).json({ error:'Errore durante la ricerca dei film.' });
    }
});

router.get("/:id", async (req :Request,res :Response):Promise<void>=> {
    try{
        const movieId:string=req.params.id;
        const movie=await Movie.findById(movieId);

        if(!movie){
            return res.status(404).json({error:"Film non trovato"});
        }

        res.json({
            movie:{
                _id :movie._id,
                title :movie.title,
                description :movie.description,
                poster :movie.poster,
                fileName :movie.fileName
            },
        });
        
   }catch(error){
       console.error("Errore nel recupero del film:", error);
       res.status(500).json({ error:"Errore durante il recupero del film."});
   }
});

// Elimina un film
router.delete("/:id", async(req :Request,res :Response):Promise<void>=>{
  try{
     if(!req.body.isAdmin){
         return res.status(403).json({error:"Non autorizzato"});
     }

     const movie=await Movie.findById(req.params.id);

     if(!movie){
         return res.status(404).json({error:"Film non trovato"});
     }

     const moviePath=path.join(__dirname,"../Movies",movie.fileName);

     if(fs.existsSync(moviePath)){
         fs.unlinkSync(moviePath);
     }

     await Review.deleteMany({ movie:req.params.id });

     await Movie.findByIdAndDelete(req.params.id);

     res.json({message:"Film e recensioni eliminati con successo"});

  }catch(error){
       console.error("Errore durante l'eliminazione del film:", error);
       res.status(500).json({error:"Errore durante l'eliminazione del film"});
   }
});

// Aggiungi una valutazione a un film
router.post('/:id/rating', async(req :Request,res :Response):Promise<void>=>{
   try{
       const { rating , comment }: { rating:number ; comment?:string} = req.body;
       const userId:string=req.session.userId;

       if(!userId){
           return(res.status(401)).json({"error":"Utente non autenticato."});
       }

       if(!rating || rating<1 || rating >5){
           return(res.status(400)).json({"error":"Il voto deve essere tra 1 e 5."});
       }

       const movie=await Movie.findById(req.params.id);

       if(!movie){
           return(res.status(404)).json({"error":"Film non trovato."});
       }

       // Controlla se esiste già una recensione per questo utente e questo film
       
       let existingReview=await Review.findOne({"user":userId,"movie":movie._id});   

   // Se esiste aggiorna la recensione

   if(existingReview){

               existingReview.rating=rating;

               existingReview.comment=(comment || existingReview.comment);

               await existingReview.save();

           // Altrimenti crea una nuova recensione

           }else{

               let newReview=new Review({

                   user:userId,

                   movie:(<any>movie)._id,

                   rating,

                   comment,

               });

               await newReview.save();

           }


           // Calcola la media delle valutazioni 

           let reviews=await Review.find({"movie":(<any>movie)._id}); 
         
         
         let totalRatings:number=reviews.reduce((sum:number , review:{rating:number})=>sum+review.rating ,0);

         (<any>movie).rating=totalRatings/reviews.length;

         await (<any>movie).save();

         // Risposta finale 

         res.json({

             message:"Recensione aggiunta o aggiornata con successo!",

             rating:(<any>movie).rating,

             reviews,

             user:userId,

         });

   }catch(error){

     
   
   

   
  

     
    

    
     

     
     

     
     
 
      

  
   

      
     
      
     
    

      
    
  

      
    
        

        
         
        
     

        

        
        

        
        

        
        

         
         
 
      

   
   
 
      

      
      
    

    

    
  
   

  
    
  
   
    
  
   
 

    
  

    
  
  

    
  

    

   

   

 


    
    
 

   
    
    


   
    
 
    
  


  
    
 
    
 




  
  
 
 
 
 



  
  
 
  
 
  
   

  


 


 


 


 


  


 


 


}


exports.default = router;