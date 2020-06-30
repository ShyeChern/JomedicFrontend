// function to leading zero
const appendLeadingZeroes = str => {
  var zeros = '';
  var limit = 2;
  for (var i = 0; i < limit; i++) {
    zeros += '0';
  }
  return (zeros + str).slice(-1 * limit);
};

//function to return currect datetime with format
export function getTodayDate() {
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    '-' +
    appendLeadingZeroes(current_datetime.getMonth() + 1) +
    '-' +
    appendLeadingZeroes(current_datetime.getDate()) +
    ' ' +
    appendLeadingZeroes(current_datetime.getHours()) +
    ':' +
    appendLeadingZeroes(current_datetime.getMinutes()) +
    ':' +
    appendLeadingZeroes(current_datetime.getSeconds());
  return formatted_date;
}

//function to return currect date with format (DatePicker)
export function getTodayDate2() {
  let current_datetime = new Date();
  let formatted_date =
    appendLeadingZeroes(current_datetime.getDate()) +
    '/' +
    appendLeadingZeroes(current_datetime.getMonth() + 1) +
    '/' +
    current_datetime.getFullYear();
  return formatted_date;
}

//function to return currect time with format (DatePicker)
export function getTodayTime() {
  let current_datetime = new Date();
  let formatted_time =
    appendLeadingZeroes(current_datetime.getHours()) +
    ':' +
    appendLeadingZeroes(current_datetime.getMinutes());
  return formatted_time;
}

//function to return convert date time with format
export function convertDateTime(datetime) {
  let arrayDateTime = datetime.split(' ');
  let arrayDate = arrayDateTime[0].split('-');
  let formatted_date =
    arrayDate[0] +
    '-' +
    appendLeadingZeroes(arrayDate[1]) +
    '-' +
    appendLeadingZeroes(arrayDate[2]);
  let arrayTime = arrayDateTime[1].split(':');
  let formatted_time =
    appendLeadingZeroes(arrayTime[0]) +
    ':' +
    appendLeadingZeroes(arrayTime[1]) +
    ':' +
    appendLeadingZeroes(arrayTime[2]);
  return [formatted_date, formatted_time];
}

//function to return convert date time with format #2
export function convertDateTime2(datetime) {
  let arrayDateTime = datetime.split(' ');
  let arrayDate = arrayDateTime[0].split('-');
  let formatted_date =
    appendLeadingZeroes(arrayDate[2]) +
    '/' +
    appendLeadingZeroes(arrayDate[1]) +
    '/' +
    arrayDate[0];
  let arrayTime = arrayDateTime[1].split(':');
  let formatted_time =
    appendLeadingZeroes(arrayTime[0]) + ':' + appendLeadingZeroes(arrayTime[1]);
  return [formatted_date, formatted_time];
}
