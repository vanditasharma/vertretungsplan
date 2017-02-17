var json;
var parameters = {};

/**
  reads parameters in URL and adds them to the parameters map
*/
function setParametersFromURL() {
  var params = document.location.search.split("&");
  params[0] = params[0].replace("?", "");

  for (var i = 0; i < params.length; i++) {
    var param = params[i];
    parameters[param.substring(0, param.indexOf("="))] = param.substring(param.indexOf("=")+1, param.length);
  }
}

function updateVertretungsplan() { //http://stackoverflow.com/a/22790025
    /*json = {"Tag":"20.1.2017 Freitag","Time":"2017-01-20","Informationen":["Das sind Test-Informationen."],"7b":{"1":{"Stunde":"1 - 2","Fach":"DEU","Raum":"3.309","LehrerIn":"___(statt ___)","Hinweis":"\u00a0","Art":"Vertretung"},"2":{"Stunde":"3 - 4","Fach":"MA","Raum":"3.214","LehrerIn":"___","Hinweis":"\u00a0","Art":"Vertretung"},"3":{"Stunde":"5","Fach":"EN","Raum":"3.202","LehrerIn":"___","Hinweis":"\u00a0","Art":"Ausfall"}},"7a":{"1":{"Stunde":"1 - 2","Fach":"DEU","Raum":"3.309","LehrerIn":"___(statt ___)","Hinweis":"\u00a0","Art":"Vertretung"},"2":{"Stunde":"3 - 4","Fach":"MA","Raum":"3.214","LehrerIn":"___","Hinweis":"\u00a0","Art":"Vertretung"},"3":{"Stunde":"5","Fach":"EN","Raum":"3.202","LehrerIn":"___","Hinweis":"\u00a0","Art":"Ausfall"}},"9a":{"1":{"Stunde":"1 - 2","Fach":"DEU","Raum":"3.309","LehrerIn":"___(statt ___)","Hinweis":"\u00a0","Art":"Vertretung"},"2":{"Stunde":"3 - 4","Fach":"MA","Raum":"3.214","LehrerIn":"___","Hinweis":"\u00a0","Art":"Vertretung"},"3":{"Stunde":"5","Fach":"EN","Raum":"3.202","LehrerIn":"___","Hinweis":"\u00a0","Art":"Ausfall"}}};
    updatePlan(json);
    document.getElementById('plan').style.display='inline';
    document.getElementById('wrong-pswd').style.display='none';*/

    var httpreq = new XMLHttpRequest();

    httpreq.open("GET", "http://fbi.gruener-campus-malchow.de/cis/pupilplanapi.php?cert=" + parameters["cert"], true);
    httpreq.onload = function(e) {
        if (httpreq.readyState === 4) {
            if (httpreq.status === 200) {
              try {
                var responseJSON = JSON.parse(httpreq.responseText);

                if(noPlanOnline(responseJSON)) {
                  showById('kein-plan');
                } else {
                  hideById('wrong-pswd');
                  //plan has to be set visible before calling updatePlan() because
                  //calculating the correct offset for the plan wouldn't work otherwise
                  showById('plan');
                  updatePlan(responseJSON);
                }
              } catch(err) {//wrong password
                hideById('plan');
                showById('wrong-pswd');

                redirect("index.html", 2000);
              }
            } else {
                console.error(httpreq.statusText);
            }
        }
    }
    httpreq.onerror = function(e) {
        console.error(httpreq.statusText);
    }
    httpreq.send(null);
    return httpreq.responseText;

}

function noPlanOnline(json) {
  return json[0] === "false";
}

function showById(id) {
  document.getElementById(id).classList.remove('hidden');
}

function hideById(id) {
  document.getElementById(id).classList.add('hidden');
}

function redirect(url, delay) {
  setTimeout(function() {window.location.replace(url);}, delay);
}

function updatePlan(plan) {
    plan = plan[0];
    json = plan;

    updateInfo(plan);
    updatePlanPaddingTop();  //style.js
    updateClasses(plan);
}

function updateClasses(plan) {
    var noClass = ['Informationen', 'Tag', 'Time'];
    var classNames = [];
    for (var className in plan) {
        if (plan.hasOwnProperty(className)) {
            if (!noClass.includes(className)) {
                classNames.push(className);
            }
        }
    }
    // klassenNamen sortieren
    var numberPattern = new RegExp("^\\d+");
    classNames.sort(function (s1, s2) {
        var ret = parseInt(numberPattern.exec(s1)) - parseInt(numberPattern.exec(s2));
        if (ret != 0) {
            return ret;
        } else if (s1 < s2) {
            return -1;
        } else if (s1 > s2) {
            return 1;
        }
        return 0;
        });
    // update
    for (var i = 0; i < classNames.length; i += 1) {
        var className = classNames[i];
        var schoolClass = plan[className];
        updateClass(className, schoolClass);
    }
}

function updateClass(className, schoolClass) {
    var entryNumbers = [];
    for (var entryNumber in schoolClass) {
        if (schoolClass.hasOwnProperty(entryNumber)) {
            entryNumbers.push(entryNumber);
        }
    }
    // eintragsNummern wie Zahlen sortieren, obwohl sie Strings sind
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    entryNumbers.sort(function (s1, s2) { return parseInt(s1) - parseInt(s2); })
    // addiere Eintraege auf
    var entries = [];
    var lastEntry;
    for (var i = 0; i < entryNumbers.length; i += 1) {
        var entryNumber = entryNumbers[i];
        var entry = schoolClass[entryNumber];
        if (isNewEntry(entry)) {
            lastEntry = {"Raum":"", "Fach":"", "Hinweis":"", "Art":"", "Stunde":""};
            entries.push(lastEntry);
        }
        lastEntry["Raum"] += entry["Raum"] + " ";
        lastEntry["Fach"] += entry["Fach"] + " ";
        lastEntry["Hinweis"] += entry["Hinweis"] + " ";
        lastEntry["Art"] += entry["Art"] + " ";
        lastEntry["Stunde"] += entry["Stunde"] + " ";
    }
    // update mit addierten Eintraegen
    for (var i = 0; i < entries.length; i += 1) {
        var entry = entries[i];
        updateBox(className,
             entry["Raum"],
             entry["Fach"],
             entry["Stunde"],
             entry["Hinweis"],
             entry["Art"]);
        console.log(entry);
    }
}

var allSpace = new RegExp("^\\s*$");
function isAllSpace(string) {
    return allSpace.exec(string) != null;
}
function isNewEntry(eintrag) {
    return !isAllSpace(eintrag["Art"]);
}

function updateInfo(plan) {
  var infos = plan["Informationen"];
  var text = '';

  if (infos!==undefined && infos!=='') {
    for (var i = 0; i < infos.length; i++) {

      var info = infos[i];

      if(info!==undefined && info.length>1) {
        text += info;

        if (i<infos.length-1) {
          text+='\n';
        }
      }

    }

    document.getElementById('info-text').innerText=text;
  } else {
    hideById('info-text');
  }
}

setParametersFromURL();
updateVertretungsplan();
