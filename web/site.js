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

    let ready = 0;
    let validation = 0;
    let denied = 0;
    let inProgress = 0;

    for (const obj of data) {
      if (obj.State === "Datensatz steht bereit") ready++;
      if (obj.State === "Anfrage wird geprüft") validation++;
      if (obj.State === "Bereitstellung nicht möglich") denied++;
      if (obj.State === "In Abstimmung") inProgress++;
    }

    var stats = [
      {
        title: "Datensatz steht bereit",
        count: ready,
        color: "green"
      },

      {
        title: "Anfrage wird geprüft",
        count: validation,
        color: "orange"
      },
      {
        title: "Bereitstellung nicht möglich",
        count: denied,
        color: "red"
      },
      {
        title: "In Abstimmung",
        count: inProgress,
        color: "blue"
      },
    ];

    console.info(stats);

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
