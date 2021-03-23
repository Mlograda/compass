COMPASS
=======

<--GENERAL-->
my first tiny WEB app developped to allow users to create camp sites, eventually the entries may be edited or deleted. signed users can leave reviews to share their experience.
* This app was developped using Nodejs, Express and MongoDB.
* Deployed on Heroku: [Compass](https://compass-ml.herokuapp.com/)

<--Main Extra Packages Used-->
* Passport for authentification.
* SendGrid to communicate emails to users upon subscription and password resetting(used along with Nodemailer).
* Cloudinary used to store camps images.
* MapBox to view camps locations on a map.

<--Usage-->
You may view the app functionality on [Compass](https://compass-ml.herokuapp.com/) or you can download the Code and perform the following:
1. in the CL console surf to your downloaded folder run >> npm install. 
2. to be able to run this app on your localhost(default to pot 3000), you must acquire some attributes for the diffrent packages installed therefore it is mandatory to create Cloudinary , Mapbox, Sendgrid and MongoDb Atlas Accounts.
3. Create .env file in the root directory and set up the following params:

* CLOUDINARY_CLOUD_NAME='YOUR CLOUDINARY NAME GOES HERE'
* CLOUDINARY_KEY='YOUR CLOUDINARY KEY GOES HERE'
* CLOUDINARY_SECRET='YOUR CLOUDINARY SECRET GOES HERE'
* MAPBOX_TOKEN= 'MAPBOX TOKEN GOES HERE'
* SECRET='YOUR SESSION SECRET KEY GOES HERE'
* DB_URL='YOU MONGODB ATLAS URL GOES HERE'
* NODEMAILER_KEY='YOUR SENDgriD API KEY GOES HERE'

PS: Keep intouch incase you face issues!