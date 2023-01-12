$(function () {
  const mockData = {
    dates: [
      "2022-05-06 10:59:42.518352",
      "2022-05-06 11:59:42.518352",
      "2022-05-06 12:59:42.518352",
      "2022-05-06 13:59:42.518352",
      "2022-05-16 10:59:42.518352",
      "2022-05-16 11:59:42.518352",
      "2022-05-16 12:59:42.518352",
      "2022-05-16 13:59:42.518352",
      "2022-05-17 12:59:42.518352",
      "2022-05-17 13:59:42.518352",
      "2022-06-24 12:59:42.518352",
      "2022-07-23 13:59:42.518352",
      "2022-07-29 12:59:42.518352",
      "2022-08-24 13:59:42.518352",
      "2022-09-24 13:59:42.518352",
      "2022-10-24 13:59:42.518352",
      "2022-11-12 13:59:42.518352",
      "2022-11-13 13:59:42.518352",
      "2022-11-14 13:59:42.518352",
      "2022-11-15 13:59:42.518352",
      "2022-11-16 13:59:42.518352",
      "2022-11-17 13:59:42.518352",
      "2022-11-18 13:59:42.518352",
      "2022-11-19 10:59:42.518352",
      "2022-11-20 13:59:42.518352",
      "2022-11-20 16:59:42.518352",
    ],
    amounts: [
      120.42, 220.21, 102.11, 132.26, 220.42, 126.21, 548.11, 941.26, 986.11,
      449.26, 495.11, 449.26, 986.11, 449.26, 154.23, 212.21, 565.36, 958.23,
      215.26, 255.36, 874.26, 348.16, 399.15, 498.35, 520.35, 100,
    ],
  };
  let days = $("#days").val();

  function newFindClosest(dates, testDate) {
    var differ = [];
    var max = dates.length;
    for (var i = 0; i < max; i++) {
      var arrDate = new Date(dates[i]);
      var diff = (arrDate - testDate) / (3600 * 24 * 1000);
      differ.push(Math.abs(diff));
    }

    const min = Math.min(...differ);

    const index = differ.indexOf(min);
    return index;
  }

  function DateFormat(date) {
    return moment(date).format("YYYY-MM-DD");
  }

  let sumDate = 0;
  let originSeries = {
    dates: [],
    amounts: [],
  };
  mockData.dates.map((d, index) => {
    if (
      index > 0 &&
      DateFormat(new Date(d)) !==
        DateFormat(new Date(mockData.dates[index - 1]))
    ) {
      originSeries.amounts.push(sumDate);
      originSeries.dates.push(new Date(mockData.dates[index - 1]));
      sumDate = mockData.amounts[index];
      if (index + 1 == mockData.dates.length) {
        originSeries.amounts.push(mockData.amounts[index]);
        originSeries.dates.push(new Date(mockData.dates[index]));
      }
    } else {
      sumDate += mockData.amounts[index];
      if (index + 1 == mockData.dates.length) {
        originSeries.amounts.push(sumDate);
        originSeries.dates.push(new Date(mockData.dates[index]));
      }
    }
  });

  const getDataPerDays = (data, day) => {
    let date = new Date();
    let temp = {
      dates: [],
      amounts: [],
    };
    let sum = 0;

    if (day == "1") {
      data.dates.map((d, index) => {
        sum += data.amounts[index];
        temp.dates.push(Date.parse(new Date(d).toString()));
        temp.amounts.push(sum);
      });
    } else {
      if (day == "all") {
        function datediff(first, second) {
          return Math.round((second - first) / (1000 * 60 * 60 * 24));
        }

        day = datediff(
          new Date(data.dates[0]),
          new Date(data.dates[data.dates.length - 1])
        );
      }
      const closet = newFindClosest(
        originSeries.dates,
        new Date(date.getTime() - day * 24 * 60 * 60 * 1000)
      );
      for (let index = 0; index <= day; index++) {
        const includeDateIndex = originSeries.dates.findIndex(
          (compare) =>
            DateFormat(new Date(compare)) ==
            DateFormat(
              new Date(date.getTime() - (day - index) * 24 * 60 * 60 * 1000)
            )
        );
        if (includeDateIndex !== -1) {
          sum += originSeries.amounts[includeDateIndex];

          temp.dates.push(
            Date.parse(
              new Date(
                date.getTime() - (day - index) * 24 * 60 * 60 * 1000
              ).toString()
            )
          );
          temp.amounts.push(sum);
        } else {
          if (index === 0) {
            temp.dates.push(
              Date.parse(
                new Date(
                  date.getTime() - (day + 1) * 24 * 60 * 60 * 1000
                ).toString()
              )
            );
            sum += originSeries.amounts[closet > 0 ? closet - 1 : 0];
            temp.amounts.push(sum);
          } else {
            temp.dates.push(
              Date.parse(
                new Date(
                  date.getTime() - (day - index) * 24 * 60 * 60 * 1000
                ).toString()
              )
            );
            temp.amounts.push(temp.amounts[index - 1]);
          }
        }
      }
    }
    return temp;
  };

  const getOriginData = (data, days) => {
    let date = new Date();
    let last = new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
    let temp = {
      dates: [],
      amounts: [],
    };
    let closet = newFindClosest(data.dates, new Date(last.getTime()));
    if (closet == -1) {
      temp.dates = data.dates;
      temp.amounts = data.amounts;
    } else {
      temp.dates = data.dates.slice(closet);
      temp.amounts = data.amounts.slice(closet);
    }
    return temp;
  };
  const getSum = (data) => {
    return data.amounts.reduce((a, b) => a + b, 0).toFixed(2);
  };

  let originData = getOriginData(mockData, days);
  let chartData = getDataPerDays(originData, days);
  let sum = getSum(originData);
  $("#sum").html(sum.toLocaleString("en-US"));
  $("#mercury-balance").html(sum.toLocaleString("en-US"));

  var options = {
    chart: {
      height: 400,
      type: "area",
      toolbar: {
        autoSelected: "pan",
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        speed: 500,
      },
    },
    dataLabels: {
      enabled: false,
    },
    series: [
      {
        name: "Series 1",
        data: chartData.amounts,
      },
    ],
    colors: ["#5466f9"],
    stroke: {
      curve: "smooth",
      colors: ["#5466f9"],
      width: 1,
    },
    fill: {
      colors: ["#5466f9"],
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 900],
      },
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: chartData.dates,
      type: "datetime",
      labels: {
        formatter: function (value) {
            if (days == "1") {
              return moment(value).format("MMM DD hh:mm:ss");
            } else {
              return moment(value).format("MMM DD");
            }
          },
      },
    },
    yaxis: {
      show: false,
    },
    markers: {
      size: 0,
      colors: ["#e0e3fe"],
      strokeColors: "#5466f9",
      strokeWidth: 1,
      hover: {
        size: 5,
        sizeOffset: 3,
      },
    },
    tooltip: {
      enabled: true,
      followCursor: false,
      x: {
        show: false,
        formatter(val) {
          return null;
        },
      },
      custom({ dataPointIndex }) {
        const currentDate = new Date(chartData.dates[dataPointIndex]);
        let newData = {
          dates: [],
          amounts: [],
        };
        const date = new Date();
        if (days == "1") {
          originData.dates.map((d, index) => {
            newData.dates.push(Date.parse(new Date(d).toString()));
            newData.amounts.push(originData.amounts[index]);
          });
        } else {
          if (days == "all") {
            function datediff(first, second) {
              return Math.round((second - first) / (1000 * 60 * 60 * 24));
            }

            days = datediff(
              new Date(originData.dates[0]),
              new Date(originData.dates[originData.dates.length - 1])
            );
          }
          const closet = newFindClosest(
            originSeries.dates,
            new Date(date.getTime() - days * 24 * 60 * 60 * 1000)
          );
          for (let index = 0; index <= days; index++) {
            const includeDateIndex = originSeries.dates.findIndex(
              (compare) =>
                DateFormat(new Date(compare)) ==
                DateFormat(
                  new Date(
                    date.getTime() - (days - index) * 24 * 60 * 60 * 1000
                  )
                )
            );
            if (includeDateIndex !== -1) {
              newData.dates.push(
                Date.parse(
                  new Date(
                    date.getTime() - (days - index) * 24 * 60 * 60 * 1000
                  ).toString()
                )
              );
              newData.amounts.push(originSeries.amounts[includeDateIndex]);
            } else {
              if (index === 0) {
                newData.dates.push(
                  Date.parse(
                    new Date(
                      date.getTime() - (days + 1) * 24 * 60 * 60 * 1000
                    ).toString()
                  )
                );
                newData.amounts.push(
                  originSeries.amounts[closet > 0 ? closet - 1 : 0]
                );
              } else {
                newData.dates.push(
                  Date.parse(
                    new Date(
                      date.getTime() - (days - index) * 24 * 60 * 60 * 1000
                    ).toString()
                  )
                );
                newData.amounts.push(newData.amounts[index - 1]);
              }
            }
          }
        }
        let originIndex = originData.dates.findIndex(
          (data) => DateFormat(data) == DateFormat(currentDate)
        );
        $("#mercury-balance").html(
          chartData.amounts[dataPointIndex].toLocaleString("en-Us")
        );
        return (
          '<div class="arrow_box">' +
          `<p>${
            days == "1"
              ? moment(chartData.dates[dataPointIndex]).format(
                  "MMM DD hh:mm:ss a"
                )
              : moment(chartData.dates[dataPointIndex]).format("MMM DD")
          }</p>` +
          '<div class="price">'+
          `${newData.amounts[dataPointIndex-1] <= newData.amounts[dataPointIndex] ? '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>5-Arrow Up</title><g fill="#26ad06" id="_5-Arrow_Up" data-name="5-Arrow Up"><path d="M31,0H15V2H28.59L.29,30.29l1.41,1.41L30,3.41V16h2V1A1,1,0,0,0,31,0Z"/></g></svg>' : '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>8-Arrow Down</title><g fill="#ff0000" id="_8-Arrow_Down" data-name="8-Arrow Down"><path d="M30,15V28.59L1.71.29.29,1.71,28.59,30H16v2H31a1,1,0,0,0,1-1V15Z"/></g></svg>'}` +
          `<p>$${
            originIndex == -1
              ? 0
              : newData.amounts[dataPointIndex].toLocaleString("en-US")
          }</p>` +
          "</div>"
        );
      },
    },
  };

  var chart = new ApexCharts(document.querySelector("#custom-area"), options);

  chart.render();

  //custom Select
  $("select").each(function () {
    var $this = $(this),
      numberOfOptions = $(this).children("option").length;

    $this.addClass("select-hidden");
    $this.wrap('<div class="select"></div>');
    $this.after('<div class="select-styled"></div>');

    var $styledSelect = $this.next("div.select-styled");
    $styledSelect.text($this.children("option").eq(0).text());

    var $list = $("<ul />", {
      class: "select-options",
    }).insertAfter($styledSelect);

    for (var i = 0; i < numberOfOptions; i++) {
      $("<li/>", {
        text: $this.children("option").eq(i).text(),
        rel: $this.children("option").eq(i).val(),
      }).appendTo($list);
    }

    var $listItems = $list.children("li");

    $styledSelect.click(function (e) {
      e.stopPropagation();
      $("div.select-styled.active")
        .not(this)
        .each(function () {
          $(this).removeClass("active").next("ul.select-options").hide();
        });
      $(this).toggleClass("active").next("ul.select-options").toggle();
    });

    $listItems.click(function (e) {
      days = $(this).attr("rel");
      e.stopPropagation();
      $styledSelect.text($(this).text()).removeClass("active");
      $this.val(days);
      $list.hide();
      originData = getOriginData(mockData, days);
      chartData = getDataPerDays(originData, days);
      sum = getSum(originData);
      $("#sum").html(sum);
      $("#mercury-balance").html(sum);
      const date = new Date();
      let min = new Date(date.getTime() - days * 24 * 60 * 60 * 1000).getTime();
      if (days == "all") {
        min = new Date(originSeries.dates[0]).getTime();
      }
      chart.updateOptions({
        series: [{ data: chartData.amounts }],
        xaxis: {
          categories: chartData.dates,
          type: "datetime",
          min,
          labels: {
            formatter: function (value) {
              if (days == "1") {
                return moment(value).format("MMM DD hh:mm:ss");
              } else {
                return moment(value).format("MMM DD");
              }
            },
          },
        },
      });
    });

    $(document).click(function () {
      $styledSelect.removeClass("active");
      $list.hide();
    });
  });
});
