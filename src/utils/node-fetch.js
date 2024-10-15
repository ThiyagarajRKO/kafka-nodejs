import fetch from "node-fetch";

export const GetResponse = (url, method, headers, body) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!headers) {
        headers = {
          "content-type": "application/json",
        };
      } else if (!headers["content-type"]) {
        headers["content-type"] = "application/json";
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      let data = await response.json();

      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
};
