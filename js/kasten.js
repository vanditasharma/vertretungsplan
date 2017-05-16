var lastClass = '';
var allClassNames = [];

function getBoxContainer() {
  return document.getElementById('kasten-container');
}

function getInfoContainer() {
  return document.getElementById('info-container');
}

function updateBox(klasse, raum, fach, stunde, hinweis, art) {
  if (allClassNames.indexOf(klasse) === -1) {
    allClassNames.push(klasse);
  }

  if (!classShouldBeShown(klasse)) {
    return;
  }

  checkIfNewClass(klasse);

  var box = createBox();
  box.classList.add(findBorderColorCssClassByGrade(klasse));

    var top = createDivWithClass('top');

      var kastenFach = createDivWithClass('kasten-fach');
      kastenFach.innerText = fach;
      kastenFach.style.fontSize = fontSizes['kasten-fach'] + 'em';
      top.appendChild(kastenFach);

      var kastenRaum = createDivWithClass('kasten-raum');
      if (raum.indexOf('---') === -1) {
        kastenRaum.innerText = raum;
      }
      kastenRaum.style.fontSize = fontSizes['kasten-raum'] + 'em';
      top.appendChild(kastenRaum);

      var kastenStunde = createDivWithClass('kasten-stunde');
      kastenStunde.innerText = stunde;
      kastenStunde.style.fontSize = fontSizes['kasten-stunde'] + 'em';
      top.appendChild(kastenStunde);

    box.appendChild(top);

    if (hinweis.length > 2) {
      var middle = createDivWithClass('middle');
      middle.innerText = hinweis;
      middle.style.fontSize = fontSizes['kasten-hinweis'] + 'em';
      box.appendChild(middle);
    }

    var bottom = createDivWithClass('bottom');

      var kastenArt = createDivWithClass('kasten-art');
      if (art.indexOf('Ausfall') !== -1) {
        kastenArt.classList.add('ausfall');
      } else if (art.indexOf('Vertretung') !== -1) {
        kastenArt.classList.add('vertretung');
      }
      kastenArt.innerText = art;
      kastenArt.style.fontSize = fontSizes['kasten-art'] + 'em';
      bottom.appendChild(kastenArt);

    box.appendChild(bottom);

  getBoxContainer().appendChild(box);
}

function createDivWithClass(className) {
  var div = document.createElement('div');
  div.classList.add(className);
  return div;
}

function updateBoxClass(schoolClass) {
  var box = createBox();
  box.classList.add('klasse');
  box.classList.add(findBgColorCssClassByGrade(schoolClass));
  box.style.fontSize = fontSizes['kasten-klasse'] + 'em';

  var p = document.createElement('p');
  p.innerText = schoolClass;
  box.appendChild(p);

  getBoxContainer().appendChild(box);
}

function updateInfoDateBox(date) {
  getInfoContainer().appendChild(createInfoDateBox(date));
}

function updateInfoBox(info) {
  getInfoContainer().appendChild(createInfoBox(info));
}

function createInfoBox(text) {
  var box = document.createElement('div');
  box.classList.add('info-kasten');

  addTextWithBRs(box, text);
  
  return box;
}

function createInfoDateBox(date) {
  var box = createInfoBox(date);
  box.classList.add('info-date');
  return box;
}

function findBorderColorCssClassByGrade(schoolClass) {
  return findBgColorCssClassByGrade(schoolClass) + '-border';
}

function findBgColorCssClassByGrade(schoolClass) {
  if (schoolClass.includes('7')) {
    return 'grade-seven';
  } else if (schoolClass.includes('8')) {
    return 'grade-eight';
  } else if (schoolClass.includes('9')) {
    return 'grade-nine';
  } else if (schoolClass.includes('10')) {
    return 'grade-ten';
  } else if (schoolClass.includes('11')) {
    return 'grade-eleven';
  } else if (schoolClass.includes('12')) {
    return 'grade-twelve';
  } else if (schoolClass.includes('13')) {
    return 'grade-thirteen';
  }

  return 'no-grade';
}

var dateCounter = 0;
function updateBoxDate(date) {
  var box = createBox();
  box.classList.add('date');

  var p = document.createElement('p');
  p.innerText = date;
  p.style.fontSize = fontSizes['kasten-date'] + 'em';
  box.appendChild(p);

  if (dateCounter > 0) {
    getBoxContainer().appendChild(document.createElement('br'));
  }
  getBoxContainer().appendChild(box);

  dateCounter++;
}

function createBox() {
  var box = document.createElement('div');
  box.classList.add('kasten');
  return box;
}

function classShouldBeShown(schoolClass) {
  var klasseShouldBeShown = parameters['klasse'] == undefined ||
    parameters['klasse'] == '' ||
    parameters['klasse'] === schoolClass;

  var klassenstufeShouldBeShown = parameters['klassenstufe'] == undefined ||
    parameters['klassenstufe'] == '' ||
    schoolClass.includes(parameters['klassenstufe']);

  return (klasseShouldBeShown && klassenstufeShouldBeShown);
}

function checkIfNewClass(schoolClass) {
  if (schoolClass != lastClass) {
    updateBoxClass(schoolClass);
  }

  lastClass = schoolClass;
}
//updateKasten("11a", "2.209", "BIO", "5", "Ausfall", "Ausfall");
