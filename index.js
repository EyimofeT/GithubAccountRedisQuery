import express from 'express';
import fetch from 'node-fetch';
import redis from 'redis';

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);
client.connect()

const app = express();

//set response
function setResponse(username, repos) {
    return `<h2>${username} has ${repos} github repos </h2>`;
}

//cache middleware
// function cache(req, res, next) {
//     // await client.connect()
//     const { username } = req.params;
//     client.GET(username, async (err, data) => {
//         if (err) throw err;
//         if (data !== null) {
//             res.send(setResponse(username, data));
//         }
//         else {
//             next();
//         }
//     })
//     // client.quit();
//     // next()
//     // client.GET
// }

app.get('/repos/:username', getRepos)
app.get('/repos-test/:username', getRepostest)

async function getRepostest(req, res, next) {
    console.log(client)
    var username="eyimofet"
    console.log("here")
    client.get("test", async function(err, value) {
        if (err) {
            console.error("error");
        } else {
            console.log("Worked: " + value);
        }
    })
}

//make request to github for data
async function getRepos(req, res, next) {
    
    const { username } = req.params;
    console.log("here")
    try {
        console.log("here1")
        client.GET(`${username}`), async(err, data) => {
            console.log("here1-2")
            if (err) console.error(err)
            if (data != null) {
                res.json(setResponse(username, data));
            }
            else {
                console.log(" here2")
                console.log('Fetching Data...')
                // const { username } = req.params;
                const response = await fetch(`https://api.github.com/users/${username}`);
                const data = await response.json();
                const repos = data.public_repos;
                // //set data to redis
                //await client.connect()
                //client.SETEX(username,3600,repos);
                client.SET(username, repos);
                client.expire(username, 60)
                res.json(setResponse(username, repos))
                // client.quit();
            }
        }
    }
    catch (err) {
        console.error(err);
        res.status(500)
    }

}

app.listen(PORT, () => console.log(`Server running on port : http://localhost:${PORT}`))


// client.quit();