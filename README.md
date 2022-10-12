# Udacity---image-processing-api
An image processing web API that resizes JPG format image. 
Written in TypeScript Nodejs with Express server, Jasmine for unit testing, and Sharp for image processing. Prettier and ESLint enabled.


**URL end point example:**
http://localhost:3000/api/images?filename=santamonica&width=500&height=500

**The query parameters:**
- filename: _takes only name without .jpg extension._ 
- width: _must be number and greater than 0._
- height: _must be number and greater than 0._


## Setup Instruction:
1. Run `npm run prettier` to confirm all files are formatted.
2. Run `npm run lint` to confirm all files are error-free.
3. Run `npm run start` to start the server from the ./src folder. And you should be able to start testing. See testing instructions below.
4. Run `npm run test` to transpile TS files from ./src folder into JS files in ./build folder, and run unit testing scripts. All 29 unit testing cases should be passed.
5. Run `node build/.` to start the server from the ./build folder. And you should be able to start testing again. See testing instructions below.


## Testing Instruction:
1. Put a full size jpg file into ./images/full folder.
2. Update the values of query parameters in the url end point with your filename (no .jpg), your desired resize width and height (must > 0). 
3. Run the url in the browser. You should be able to view the resized image.
4. Check the resized image in ./images/thumb folder if you are resizing the image to this size for the first time. 
    - Look for file name *{original filename}_{width}x{height}.jpg*
5. Run the same url again. The same thumb image should stay without any modification.
6. Try run with different resized width and height for the same file. You should be able to see multiple resized images stored in the thumb folder with respective name.

## Notes:
1. If encounter any error, check the file ./debug.log for more information.
2. The information about images being processed or accessed is logged in ./debug.log. 
    - If being accessed, the message is _"Resize file exists. Send directly to the response."_ 
    - If being processed, the message is _"Resize file not found. Resize, save to file, and send to the response."_






