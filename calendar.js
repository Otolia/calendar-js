/**
 * Created by amauryconstant on 04/12/2016.
 */

const ISO_DAY_FORMAT = 'YYYY-MM-DD';
const READABLE_DAY_FORMAT = 'dddd DD';
const MOMENT_DATE_HELPER = '2001-01-01 ';

/**
 * Single call function handling the construction of the complete 7 days calendar
 *
 * @param $container
 * @param calObj
 */
function buildCalendar($container, calObj) {
    console.log(calObj);

    var calcCalendar = {};

    calcCalendar.dayIt = {start: moment(calObj.from), end: moment(calObj.to)};
    calcCalendar.structure = calcCalendarStructure(calObj);
    calcCalendar.content = calcCalendarContent(calObj);

    console.log(calcCalendar);

    var sdBodyObj = buildCalendarStructure($container, calcCalendar.dayIt, calcCalendar.structure);

    console.log(sdBodyObj);

    buildCalendarContent(sdBodyObj, calcCalendar.dayIt, calcCalendar.content)
}

/**
 * Calculate the overarching structure of the calendar
 * @param calObj
 * @returns {{}}
 */
function calcCalendarStructure(calObj) {
    var startCal = moment(calObj.from),
        endCal = moment(calObj.to),
        calStruct = {};

    calStruct.nbCol = endCal.diff(startCal, 'day') + 1;

    calStruct.sdWidth = _.floor(100 / calStruct.nbCol, 3) + '%';

    calStruct.singleDays = {};
    for (var dayIt = moment(startCal); dayIt.isSameOrBefore(endCal); dayIt.add(1, 'days')) {
        calStruct.singleDays[dayIt.format(ISO_DAY_FORMAT)] = dayIt.format(READABLE_DAY_FORMAT);
    }

    return calStruct;
}

function calcCalendarContent(calObj) {
    var startCal = moment(calObj.from),
        endCal = moment(calObj.to),
        dayBounds = {start: moment(MOMENT_DATE_HELPER + calObj.dayStartTime), end: moment(MOMENT_DATE_HELPER + calObj.dayEndTime)},
        events = calObj.events,
        calContent = {};

    calContent.dayDuration = dayBounds.end.diff(dayBounds.start, 'minutes');

    calContent.calcSingleDayBodyScale = function(sdBody) { return sdBody.height() / calContent.dayDuration};

    calContent.dailyContents = {};
    for (var dayIt = moment(startCal); dayIt.isSameOrBefore(endCal); dayIt.add(1, 'days')) {
        var dailyEvents = _.filter(events, function (event) {
            return moment(event.date).isSame(dayIt);
        });
        calContent.dailyContents[dayIt.format(ISO_DAY_FORMAT)] = calcCalendarDailyContent(dailyEvents, dayBounds);
    }

    return calContent;
}
/**
 *
 * @param dailyEvents array
 * @param dayBounds
 */
function calcCalendarDailyContent(dailyEvents, dayBounds) {
    var array = [];

    _.forEach(dailyEvents, function (event, it) {
        var eventStart = moment(MOMENT_DATE_HELPER + event.startTime),
            eventEnd = moment(MOMENT_DATE_HELPER + event.endTime),
            calcEvent = {};

        calcEvent.fromDayStart = eventStart.diff(dayBounds.start, 'minutes');

        calcEvent.duration = eventEnd.diff(eventStart, 'minutes');

        calcEvent.concurrent = concurrentEvents(dailyEvents, eventStart, eventEnd);

        calcEvent.width = _.round(100 / calcEvent.concurrent, 3) + '%';

        calcEvent.order = it;

        calcEvent.calcFloat = function ($sdBody) {return $sdBody.width() / calcEvent.concurrent * calcEvent.order};

        calcEvent.name = event.name;

        array.push(calcEvent);
    });

    return array;
}

function concurrentEvents(dailyEvents, calcEventStart, calcEventEnd) {
    var res = 0;

    _.forEach(dailyEvents, function (event) {
        var eventStart = moment(MOMENT_DATE_HELPER + event.startTime),
            eventEnd = moment(MOMENT_DATE_HELPER + event.endTime);

        if (calcEventStart.isBetween(eventStart, eventEnd) || calcEventEnd.isBetween(eventStart, eventEnd))
            res++;
    });

    return res;
}

function buildCalendarStructure($container, dayItObj, calcStructure) {
    var sdBodyObj = {};

    for (var dayIt = moment(dayItObj.start); dayIt.isSameOrBefore(dayItObj.end); dayIt.add(1, 'days')) {
        var dayStr = dayIt.format(ISO_DAY_FORMAT);
        sdBodyObj[dayStr] = buildDailyStructure($container, calcStructure.sdWidth, calcStructure.singleDays[dayStr]);
    }

    return sdBodyObj;
}

function buildDailyStructure($container, sdWidth, name) {
    var dayDiv = document.createElement('div');
    dayDiv.className = 'single-day';
    dayDiv.style.setProperty('width', sdWidth, '');

    var dayDivHeader = document.createElement('div');
    dayDivHeader.className = 'sd-header';
    dayDivHeader.innerHTML = name;
    dayDiv.appendChild(dayDivHeader);

    var dayDivBody = document.createElement('div');
    dayDivBody.className = 'sd-body';
    dayDiv.appendChild(dayDivBody);

    $container.append(dayDiv);

    return $(dayDivBody);
}

function buildCalendarContent(sdBodyObj, dayItObj, calcContent) {
    var sdBodyScale = calcContent.calcSingleDayBodyScale(sdBodyObj[dayItObj.start.format(ISO_DAY_FORMAT)]);

    for (var dayIt = moment(dayItObj.start); dayIt.isSameOrBefore(dayItObj.end); dayIt.add(1, 'days')) {
        var dayStr = dayIt.format(ISO_DAY_FORMAT),
            dailyEvents = calcContent.dailyContents[dayStr],
            sdBody = sdBodyObj[dayStr];

        _.forEach(dailyEvents, function(event){
            buildSingleEvent(sdBody, event, sdBodyScale);
        });
    }
}

function buildSingleEvent(sdBody, event, sdBodyScale) {
    var div = $(document.createElement('div'));

    div.addClass("event");
    div.html(event.name);
    div.css({
        position:"absolute",
        top:event.fromDayStart * sdBodyScale,
        left: event.calcFloat(sdBody),
        width: event.width,
        height: (event.duration * sdBodyScale) + "px"
    });

    sdBody.append(div);
}