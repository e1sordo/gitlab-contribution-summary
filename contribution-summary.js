function waitForElement(selector, callback) {
  const observer = new MutationObserver(function(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        const matchingElement = Array.from(mutation.addedNodes).find(node =>
          node.nodeType === 1 && node.matches(selector)
        );

        if (matchingElement) {
          observer.disconnect();
          callback(matchingElement);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

function injectStatsToPage(statistics) {
  const jsContribCalendar = document.querySelector('div.js-contrib-calendar');
  if (jsContribCalendar) {
    jsContribCalendar.style.position = 'relative';
    
    const statsDiv = document.createElement('div');
    statsDiv.style.position = 'absolute';
    statsDiv.style.top = '16px';
    statsDiv.style.left = '100%';
    statsDiv.style.whiteSpace = 'pre';
    statsDiv.style.textAlign = 'left';
    statsDiv.style.paddingLeft = '10px';
    statsDiv.style.fontSize = '12px';
    statsDiv.style.fontStyle = 'italic';
    statsDiv.style.lineHeight = '17px';
    statsDiv.style.color = '#0000008a';
    
    const sortedDays = Object.keys(statistics).sort((a, b) => {
      const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return daysOrder.indexOf(a) - daysOrder.indexOf(b);
    });
    
    let statsString = '';
    sortedDays.forEach(day => {
      const stat = statistics[day];
      const avg = stat.count > 0 ? (stat.totalContributions / stat.count).toFixed(1) : 0;
      statsString += `Total: ${stat.totalContributions}, \t\tAvg: ${avg}, \t🦾: ${stat.totalLevelGreaterThan1}\n`;
    });
    
    statsDiv.textContent = statsString;
    jsContribCalendar.appendChild(statsDiv);
  } else {
    console.log('Div with class "js-contrib-calendar" not found.');
  }
};

function main() {
  const targetSelector = "svg.contrib-calendar";

  waitForElement(targetSelector, function(element) {
    console.log("Element is now available: ", element);

    const svgParent = document.querySelector(targetSelector);

    if (svgParent) {
      const gElements = svgParent.querySelectorAll('g');
      const statistics = {
        Sunday: { count: 0, totalContributions: 0, totalLevelGreaterThan1: 0 },
        Monday: { count: 0, totalContributions: 0, totalLevelGreaterThan1: 0 },
        Tuesday: { count: 0, totalContributions: 0, totalLevelGreaterThan1: 0 },
        Wednesday: { count: 0, totalContributions: 0, totalLevelGreaterThan1: 0 },
        Thursday: { count: 0, totalContributions: 0, totalLevelGreaterThan1: 0 },
        Friday: { count: 0, totalContributions: 0, totalLevelGreaterThan1: 0 },
        Saturday: { count: 0, totalContributions: 0, totalLevelGreaterThan1: 0 }
      };

      let startCounting = false;

      gElements.forEach(gElement => {
        const rectElements = gElement.querySelectorAll('rect[title]');

        rectElements.forEach(rectElement => {
          const title = rectElement.getAttribute('title');
          const match = title.match(/(No|\d+) contribution.*(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);

          if (match) {
            const contributions = match[1] === 'No' ? 0 : parseInt(match[1]);
            const dayOfWeek = match[2];

            if (!startCounting && contributions > 0) {
              startCounting = true;
            }

            if (startCounting) {
              statistics[dayOfWeek].count++;
              statistics[dayOfWeek].totalContributions += contributions;

              const dataLevel = parseInt(rectElement.getAttribute('data-level'));
              if (dataLevel > 1) {
                statistics[dayOfWeek].totalLevelGreaterThan1++;
              }
            }
          }
        });
      });

      for (const dayOfWeek in statistics) {
        if (statistics[dayOfWeek].count > 0) {
          statistics[dayOfWeek].averageContributions = statistics[dayOfWeek].totalContributions / statistics[dayOfWeek].count;
        }
      }

      console.log(statistics);
      injectStatsToPage(statistics);
    } else {
      console.log('SVG with class "contrib-calendar" not found.');
    }
  });
};

main();
