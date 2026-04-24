CREATE DATABASE emiuBKfarm;
USE emiuBKfarm;

CREATE TABLE users (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    pwd VARCHAR(50) 
);

INSERT INTO users(username, Pass_word) VALUES 
	('user1', '123456');

