import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import fs from "fs";

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Process image route: GET /filteredimage?image_url=value
  app.get("/filteredimage", async (req, res) => {
      const { image_url } = req.query;

      if (!image_url) {
          return res.send({
              message: "Please provide an image url",
          });
      }
      // If inputURL has specific character, have to encodeURI
      const inputURL = encodeURI(image_url); 
      try {
          const result = await filterImageFromURL(inputURL);
          res.sendFile(result);

          // Handle delete files on /tmp/ folder , except current exported file 
          const files = fs.readdirSync(`${__dirname}/util/tmp/`);
          const fileNameArray = files.filter(file => {
              return !result.includes(file);
          }).map(data => {
            return `${__dirname}/util/tmp/${data}`
          })

          await deleteLocalFiles(fileNameArray);
      } catch (error) {
          return res.status(422).send({
            message: "Cannot process image. Something went very wrong!"
          });
      }

  });

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();