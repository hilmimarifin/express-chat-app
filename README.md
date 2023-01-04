# Express Chat App Api

A simple chat application API that has features including:
1. Register and login user (authentication and authorization)
2. Users can send messages to other registered users
3. Users can read the details/history of the message
4. Users can see a list of messages from other users and the number of unread messages

# How to run this api in local

1. Clone this repository
2. Run npm install
3. Create a database according to the name on .env
4. To migrate tables to the db, run npx sequelize-cli db:migrate
5. For initial data, run npx sequelize-cli db:seed:all
6. Fo start the program run npm run dev
7. To try this API, open postman, Import postman collection  in the root folder



bugs that are still not resolved:<br>
the first/initial message is not displayed in the message list if the recipient has not replied to the message (already displayed on the recipient)
