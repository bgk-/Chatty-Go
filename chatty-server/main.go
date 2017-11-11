package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"regexp"

	"github.com/gorilla/websocket"
)

var (
	clients   = make(map[*websocket.Conn]bool)
	broadcast = make(chan Message)
	upgrader  = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

// Message includes Username, Content, Type as string JSON
type Message struct {
	Key      uint64
	Username string `json:"username"`
	Content  string `json:"content"`
	Type     string `json:"type"`
	Color    string `json:"color"`
	Users    int
}

var count Message

func main() {
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)
	http.HandleFunc("/ws", handleConnections)
	go handleMessages()

	log.Println("http server stated on :9009")
	err := http.ListenAndServe(":9009", nil)
	if err != nil {
		log.Fatal("ListenAndServer: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()
	red := rand.Intn(255)
	green := rand.Intn(255)
	blue := rand.Intn(255)
	clients[ws] = true
	color := fmt.Sprintf("rgb(%d, %d, %d)", red, green, blue)
	count.Users = len(clients)
	count.Key = rand.Uint64()
	broadcast <- count

	for {
		var msg Message

		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		re := regexp.MustCompile("^post")
		msg.Type = re.ReplaceAllString(msg.Type, "incoming")
		msg.Key = rand.Uint64()
		msg.Color = color
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		fmt.Println(msg)
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
