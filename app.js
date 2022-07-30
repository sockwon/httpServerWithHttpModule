const http = require("http");
const server = http.createServer();

const users = [
    {
      id: 1,
      name: "Rebekah Johnson",
      email: "Glover12345@gmail.com",
      password: "123qwe",
    },
    {
      id: 2,
      name: "Fabian Predovic",
      email: "Connell29@gmail.com",
      password: "password",
    },
  ];
  
  const posts = [
    {
      id: 1,
      title: "간단한 HTTP API 개발 시작!",
      content: "Node.js에 내장되어 있는 http 모듈을 사용해서 HTTP server를 구현.",
      userId: 1,
    },
    {
      id: 2,
      title: "HTTP의 특성",
      content: "Request/Response와 Stateless!!",
      userId: 1,
    },
  ];

  

const httpRequestListener = (request, response)=>{
     const {method, url} = request;
     if(method === "GET"){
        if(url === "/ping"){
            response.writeHead(200, {"Content-Type": "application/json"})
            response.end(JSON.stringify("pong"));
        }
        else if(url === "/posts"){
            response.writeHead(200, {"Content-Type": "application/json"})
            response.end(JSON.stringify({posts : posts}))
        // else if(url === "/users"){
        //     response.writeHead(200, {"Content-Type": "application/json"})
        //     response.end(JSON.stringify(users));
        }
        else if(url.startsWith("/users")){ //사용자가 쓴 게시글 검색.
            const userID = parseInt((url.split("/"))[2]);
            const user = users.find((user)=>user.id === userID)
            const results = posts.filter((post)=>{return post.userId === userID})
            user.posts = results;
            response.writeHead(200, {"Content-Type": "application/json"})
            response.end(JSON.stringify({data :user}));
        }
    }
     else if(method === "POST"){//사용자 추가
        if(url === "/user/signup"){
        let body = "";
        request.on("data", (chunk)=>{
            body += chunk;
        })
        request.on("end",()=>{
            const user = JSON.parse(body);
            users.push({
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
            })
            response.writeHead(201, {"Content-Type": "application/json"})
            response.end(JSON.stringify({data : users}));
        })
     } else if(url.startsWith("/posts")){
        let body ="";
        request.on("data", (chunk)=>{
            body += chunk;
        })
        request.on("end", ()=>{
            const post = JSON.parse(body);
            const temp ={
                userID: post.userID,
	            userName: post.userName,
                postingId: post.postingId,
                postingTitle: post.postingTitle,
	            postingContent: post.postingContent
            }
            const temp2 = users.find((user)=>user.id === parseInt(temp.userID))
            if(!temp2){
              response.writeHead(404, {"Content-Type": "application/json"});
              response.end(JSON.stringify({FAILED : "NOT EXIST USER!"}))
            }
            else{posts.push(temp);
              response.writeHead(201, {"Content-Type": "application/json"});
              response.end(JSON.stringify({data : posts}))
            }
        })
      }
     }
    if(method === "PATCH"){
        const index = url.split("/")[2]
        let rawData = ""
        request.on("data", (chunk)=>{rawData += chunk});
        request.on("end", ()=>{
          const patchRawData = JSON.parse(rawData)
          let post = posts.find(post=>parseInt(index) === post.id);
          const postIndex = posts.indexOf(post);
          const nameIndex = post.userId;
          const name = users.find(user=>parseInt(nameIndex) === user.id).name
          const newPost = {
            userID: patchRawData.userID?patchRawData.userID : post.userId,
	          userName: name,
            postingId: patchRawData.postingId?patchRawData.postingId:post.id,
            postingTitle: patchRawData.postingTitle?patchRawData.postingTitle:post.title,
	          postingContent: patchRawData.postingContent?patchRawData.postingContent:post.content
        }
        posts[postIndex] = newPost;
        response.writeHead(201, {"Content-Type": "application/json"})
        response.end(JSON.stringify({data : posts}));
        })
     }
    if(method==="DELETE"){
        const postId = parseInt(url.split("/")[2]);
        const targetPost = posts.find((post=>post.id === postId))
        const targetIndex = posts.indexOf(targetPost);
        const del = posts.splice(targetIndex, 1);
        response.writeHead(204, {"Content-Type": "application/json"});
        response.end(JSON.stringify({MESSAGE : "postingDeleted"}))
    }

  }




const PORT = 8000;
const IP = '127.0.0.1';

server.on("request", httpRequestListener);
server.listen(PORT, IP, ()=>{console.log("waiting server")})