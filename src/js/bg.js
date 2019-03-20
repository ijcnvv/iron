"use strict";

const makeRequest = (url, options = {}) => {
  return fetch(url, options).then((response) => {
    if (response.status !== 200) {
      return response.text().then((text) => {
        throw new Error(text);
      })
    }

    return response.text();
  })
};

let rooms = [];

chrome.extension.onRequest.addListener(({action, data = {}}) => {

  switch (action) {
    case "save":
      const {roomid} = data;
      if (rooms.includes(roomid)) return false;

      const body = new FormData();
      body.append('val', 'labdata');
      Object.entries(data).forEach(([key, value]) => body.append(key, value));

      return makeRequest('https://ironcohort.ru/plugin/index.php', {
        method: 'POST',
        body
      })
        .then(() => rooms.push(roomid))
        .catch(({message}) => console.log(message));

    case "clear":
      return rooms = [];
  }
});