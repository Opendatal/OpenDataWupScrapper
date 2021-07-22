package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"regexp"
	"strconv"
	"time"

	"github.com/gocolly/colly"
)

type request struct {
	URL            string
	Title          string
	commentsString string
	CommentCount   int
	Date           time.Time
	State          string
	CrawledAt      time.Time
}

func main() {

	requests := []request{}

	re := regexp.MustCompile("[0-9]+")

	c := colly.NewCollector()

	c.OnHTML("article", func(e *colly.HTMLElement) {
		temp := request{}

		dateString := e.ChildAttr("div.submitted > span", "content")
		var err error

		temp.Date, err = time.Parse(time.RFC3339, dateString)

		if err != nil {
			fmt.Println(err)
		}

		temp.URL = fmt.Sprintf("https://www.offenedaten-wuppertal.de%s", e.ChildAttr("h2 > a", "href"))
		temp.Title = e.ChildText("h2 > a")
		temp.State = e.ChildText("span.status-message")
		temp.commentsString = e.ChildText("div.comment-counts")

		temp.CommentCount, err = strconv.Atoi(re.FindAllString(e.ChildText("div.comment-counts"), 1)[0])

		if err != nil {
			fmt.Println(err)
		}

		temp.CrawledAt = time.Now()
		requests = append(requests, temp)

	})

	for i := 0; i < 6; i++ {
		c.Visit(fmt.Sprintf("https://www.offenedaten-wuppertal.de/daten/anfragen?page=%d", i))
	}

	file, _ := json.MarshalIndent(requests, "", " ")

	_ = ioutil.WriteFile("./out/requests.json", file, 0644)
}
