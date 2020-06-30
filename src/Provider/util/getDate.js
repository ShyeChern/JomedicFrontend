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