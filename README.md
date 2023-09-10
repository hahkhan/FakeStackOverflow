Read the Project Specfications [here](https://docs.google.com/document/d/1zZjNk9cbNLz0mp_-YtyZxhMzUph97fVgCkSE4u2k5EA/edit?usp=sharing).

Add design docs in *images/*

## Instructions to setup and run project
- Install NodeJS and MongoDB for your operating system
- Run the Server side
    - cd into the `server` folder
    - run `npm install` to download the packages used by the application
    - run `node init.js ${adminUsername} ${adminPassword}` to initalize the database with inital data
        - Replace `${adminUsername}` with a username for the admin
            - THIS WILL ALSO BE YOUR "EMAIL" TO USE TO LOGIN
        - Replace `${adminPassword}` with a password for the admin
        - There are also some dummy accounts created with different reputation
            - 50 reputation points
                - email: `test1@stonybrook.edu`
                - password: `abc123!` 
            - 100 reputation points
                - email: `test2@stonybrook.edu`
                - password: `abc123!` 
            - 20 reputation points
                - email: `test3@stonybrook.edu`
                - password: `abc123!` 
            - 0 reputation points
                - email: `test4@stonybrook.edu`
                - password: `abc123!` 
    - run `nodemon server.js ${SECRET}` to run the server
        - Replace `${SECRET}` with a random secret to use for encrypting sessions
    - server will be running @ localhost:8000 
- Run the Client side
    - cd into the `client` folder
    - run `npm install` to download the packaged used by the application
    - run `nodemon index.js` to run the client application
    - client will be running @ localhost:3000  

## Design Pattern Usage
### Facade Pattern
Our application utilizes the Facade design pattern to provide a simple and structured access to our database API. The backend provides many get and post endpoints for getting, creating, editing, and queuerying questions, answers, tags, and users.

The client creates a `Model` class which acts a Facade for access to all of these endpoints. The `Model` class provides simple functions such as `getAllQuestions()` and `getTagById(id)` that allows the client to get information from the database without having to manually run `post` and `get` requests as the `Model` facade handles it behind the scenes.
### Observer Pattern
By using React for the client side application, our app is already utilizing the observer pattern. React hooks such as `useEffect` and `useState` that we use in the application are observers that watch for when state variables are changed and update the UI accordingly. 

