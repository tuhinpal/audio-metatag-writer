FROM ubuntu:latest

run apt update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:savoury1/ffmpeg4
RUN apt update
RUN apt install ffmpeg -y
RUN apt install npm -y

WORKDIR /app
COPY package.json /app

RUN npm install
COPY . /app
CMD node main.js
EXPOSE 8080
