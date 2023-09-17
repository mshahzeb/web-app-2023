package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func connect() (*sql.DB, error) {
	bin, err := ioutil.ReadFile("/run/secrets/db-password")
	if err != nil {
		return nil, err
	}
	return sql.Open("mysql", fmt.Sprintf("root:%s@tcp(db:3306)/example", string(bin)))
}

func addVote(w http.ResponseWriter, r *http.Request) {
	db, err := connect()
	if err != nil {
		w.WriteHeader(500)
		return
	}
	defer db.Close()

	if _, err = db.Exec("INSERT INTO votes (`time`, `count`) VALUES (NOW(), '1')"); err != nil {
		log.Print(err)
		w.WriteHeader(500)
		return
	}
	json.NewEncoder(w).Encode("OK")
}


func countVotes(w http.ResponseWriter, r *http.Request) {
	db, err := connect()
	if err != nil {
		w.WriteHeader(500)
		return
	}
	defer db.Close()

	var votes string
	err = db.QueryRow("SELECT SUM(count) AS votes FROM votes").Scan(&votes)
	if err != nil {
		log.Print(err)
		w.WriteHeader(500)
		return
	}
	json.NewEncoder(w).Encode(votes)
}

type Votes struct {
	Id int
	Time string
	Count int
}

func getVotes(w http.ResponseWriter, r *http.Request) {
	db, err := connect()
	if err != nil {
		w.WriteHeader(500)
		return
	}
	defer db.Close()

	rows, err := db.Query("SELECT * FROM votes")
	if err != nil {
		w.WriteHeader(500)
		return
	}
	var votes []Votes
	for rows.Next() {
		vote := new(Votes)
		err = rows.Scan(&vote.Id, &vote.Time, &vote.Count)
		votes = append(votes, *vote)
	}
	json.NewEncoder(w).Encode(votes)
}

func main() {
	log.Print("Prepare db...")
	if err := prepare(); err != nil {
		log.Fatal(err)
	}

	log.Print("Listening 8000")
	r := mux.NewRouter()
	r.HandleFunc("/add_vote", addVote)
	r.HandleFunc("/count_votes", countVotes)
	r.HandleFunc("/get_votes", getVotes)
	log.Fatal(http.ListenAndServe(":8000", handlers.LoggingHandler(os.Stdout, r)))
}

func prepare() error {
	db, err := connect()
	if err != nil {
		return err
	}
	defer db.Close()

	for i := 0; i < 60; i++ {
		if err := db.Ping(); err == nil {
			break
		}
		time.Sleep(time.Second)
	}

	if _, err := db.Exec("DROP TABLE IF EXISTS primary_db"); err != nil {
		return err
	}

	if _, err := db.Exec("CREATE TABLE IF NOT EXISTS votes (id int NOT NULL AUTO_INCREMENT, time datetime, count int, PRIMARY KEY (id))"); err != nil {
		return err
	}

	// for i := 0; i < 6; i++ {
	// 	if _, err := db.Exec("INSERT INTO blog (title) VALUES (?);", fmt.Sprintf("Blog post #%d", i)); err != nil {
	// 		return err
	// 	}
	// }
	return nil
}
