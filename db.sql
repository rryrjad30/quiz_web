drop database if exists web;
create database web;
use web;
create table data(
	id int primary key auto_increment,
	firstname varchar(10),
	lastname varchar(10),
	gender varchar(10),
	religion varchar(10),
	email varchar(20),
);