function getNumberOfDays(start, end) {
  const date1 = new Date(start);
  const date2 = new Date(end);

  const oneDay = 1000 * 60 * 60 * 24;
  const diffInTime = date2.getTime() - date1.getTime();
  const diffInDays = Math.round(diffInTime / oneDay);

  return diffInDays;
}

function loaded() {
  const svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    x = d3.scaleBand().rangeRound([0, width]).padding(0.2),
    y = d3.scaleLinear().rangeRound([height, 0]),
    g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.json(
    "https://raw.githubusercontent.com/Opendatal/OpenDataWupScrapper/main/sample/requests.json"
  ).then((data) => {
    console.info(data);

    let ready = [];
    let validation = [];
    let denied = [];
    let inProgress = [];

    for (const obj of data) {
      if (obj.State === "Datensatz steht bereit") {
        ready.push(obj);
      }
      if (obj.State === "Anfrage wird geprüft") {
        validation.push(obj);
      }
      if (obj.State === "Bereitstellung nicht möglich") {
        denied.push(obj);
      }
      if (obj.State === "In Abstimmung") {
        inProgress.push(obj);
      }
    }

    var stats = [
      {
        title: "Datensatz steht bereit",
        count: ready.length,
        color: "green",
      },
      {
        title: "Anfrage wird geprüft",
        count: validation.length,
        color: "orange",
      },
      {
        title: "Bereitstellung nicht möglich",
        count: denied.length,
        color: "red",
      },
      {
        title: "In Abstimmung",
        count: inProgress.length,
        color: "blue",
      },
    ];

    console.info(stats);

    const sortedValidations = validation.sort((a, b) => b.Date - a.Date);

    const lastItem = sortedValidations[sortedValidations.length - 1];

    console.info(getNumberOfDays(lastItem.Date, Date.now()));

    console.info(sortedValidations);

    x.domain(stats.map((d) => d.title));
    y.domain([0, d3.max(stats, (d) => d.count)]);

    g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").attr("class", "axis axis-y").call(d3.axisLeft(y).ticks(10));

    g.selectAll(".bar")
      .data(stats)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.title))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("fill", (d) => d.color)
      .attr("height", (d) => height - y(d.count));
  });
}
