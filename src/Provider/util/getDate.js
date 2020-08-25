import moment from 'moment'

export const getTodayDate = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

export const getStartOfCurrentWeek = (date) => {
    const today = moment(date)
    const fromDate = today.startOf("isoWeek")
    const startOfWeek = fromDate.format("YYYY-MM-DD")
    return startOfWeek + " 00:00:00"
}

export const getEndOfCurrentWeek = (date) => {
    const today = moment(date)
    const toDate = today.endOf("isoWeek")
    const endOfWeek = toDate.format("YYYY-MM-DD")
    return endOfWeek + " 00:00:00"
}

export const getDatesForCurrentWeek = (date) => {

    var startOfWeek = moment(date).startOf('isoWeek');
    var endOfWeek = moment(date).endOf('isoWeek');

    var days = [];
    var day = startOfWeek;

    while (day <= endOfWeek) {
        days.push(moment(day).format("YYYY-MM-DD"));
        day = day.clone().add(1, 'd');
    }

    return days;
}

export const getDatesFor7DayFromToday = () => {
    var today = moment()
    var after7Day = moment().add(6,'d')

    var days = []
    var day = today

    while (day <= after7Day){
        days.push(moment(day).format("YYYY-MM-DD"));
        day = day.clone().add(1,'d');
    }

    return days;
}

export const getDatesFor7DayFromGivenDate = (date) => {
    var today = moment(date)
    var after7Day = moment(date).add(6,'d')

    var days = []
    var day = today

    while (day <= after7Day){
        days.push(moment(day).format("YYYY-MM-DD"));
        day = day.clone().add(1,'d');
    }

    return days;
}

export const getStartOfMonth = (date) => {
    console.log("Date in Start Month " + moment(date).format("YYYY-MM-DD"))

    var startOfMonth = moment(date).startOf('month');
    return moment(startOfMonth).format("YYYY-MM-DD HH:mm:ss");
}

export const getEndOfMonth = (date) => {
    console.log("Date in End Month " + moment(date).format("YYYY-MM-DD"))

    var endOfMonth = moment(date).endOf('month');
    return moment(endOfMonth).format("YYYY-MM-DD HH:mm:ss");
}

export const getDatesForCurrentMonth = (date) => {

    console.log("Date in Dates " + date)

    var startOfMonth = moment(date).startOf('month');
    var endOfMonth = moment(date).endOf('month');

    var days = [];
    var day = startOfMonth;

    while (day <= endOfMonth) {
        days.push(moment(day).format("YYYY-MM-DD"));
        day = day.clone().add(1, 'd');
    }

    return days;
}

export const getDatesFor60DayFromGivenDate = (date) => {
    var today = moment(date)
    var afterNDay = moment(date).add(60,'d')

    var days = []
    var day = today

    while (day <= afterNDay){
        days.push(moment(day).format("YYYY-MM-DD"));
        day = day.clone().add(1,'d');
    }

    return days;
}
