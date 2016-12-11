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

    var calculatedCalendar = calcCalendar(calObj);

    constructCalendar($container, calculatedCalendar);
}

/**
 * Presenter Function
 *
 * @param calObj
 * @return {Object}
 */
function calcCalendar(calObj) {
    var calcCalendar = {};

    calcCalendar.dayIt = {start: moment(calObj.from), end: moment(calObj.to)};
    calcCalendar.structure = calcCalendarStructure(calObj);
    calcCalendar.content = calcCalendarContent(calObj);

    return calcCalendar;
}

/**
 * Calculate the overarching structure of the calendar
 *
 * @param calObj {Object}
 * @returns {Object}
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

/**
 * Calculate the content of the calendar
 *
 * @param calObj
 * @returns {Object}
 */
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
 * Calculate the content for a single day
 * @param dailyEvents
 * @param dayBounds
 * @returns {Array}
 */
function calcCalendarDailyContent(dailyEvents, dayBounds) {
    var array = [];

    _.forEach(dailyEvents, function (event, it) {
        var eventStart = moment(MOMENT_DATE_HELPER + event.startTime),
            eventEnd = moment(MOMENT_DATE_HELPER + event.endTime),
            calcEvent = {};

        calcEvent.fromDayStart = eventStart.diff(dayBounds.start, 'minutes');

        calcEvent.duration = eventEnd.diff(eventStart, 'minutes');

        calcEvent.concurrent = maxConcurrentEvents(dailyEvents, event, eventStart, eventEnd);

        calcEvent.width = _.round(100 / (calcEvent.concurrent + 1), 3) + '%';

        calcEvent.order = it;

        calcEvent.calcLeftPos = function ($sdBody) {return $sdBody.width() / (calcEvent.concurrent + 1) * (calcEvent.order % (calcEvent.concurrent + 1));};

        calcEvent.name = event.name;

        array.push(calcEvent);
    });

    return array;
}

/**
 * Calculate the max number of concurrent events
 *
 * @param dailyEvents Collection
 * @param calcEvent
 * @param calcEventStart moment
 * @param calcEventEnd moment
 * @returns {number}
 */
function maxConcurrentEvents(dailyEvents, calcEvent, calcEventStart, calcEventEnd) {
    var arr = [],
        dailyEventsFiltered = _.without(dailyEvents, calcEvent);


    arr.push(concurrentEventsForBound(dailyEventsFiltered, calcEventStart));
    arr.push(concurrentEventsForBound(dailyEventsFiltered, calcEventEnd));
    arr.push(concurrentEventsForBounds(dailyEventsFiltered, calcEventStart, calcEventEnd));

    return _.max(arr);
}

/**
 * Calculate the number concurrent events for a bound
 *
 * @param dailyEventsFiltered Collection
 * @param eventBound moment
 * @returns {number}
 */
function concurrentEventsForBound(dailyEventsFiltered, eventBound) {
    var res = 0;

    _.forEach(dailyEventsFiltered, function (event) {
        var eventStart = moment(MOMENT_DATE_HELPER + event.startTime),
            eventEnd = moment(MOMENT_DATE_HELPER + event.endTime);

        if (eventBound.isBetween(eventStart, eventEnd, null, '[]'))
            res++;
    });

    return res;
}

/**
 * Calculate the number concurrent events included inside the bounds
 *
 * @param dailyEventsFiltered Collection
 * @param eventBoundStart moment
 * @param eventBoundEnd moment
 * @returns {number}
 */
function concurrentEventsForBounds(dailyEventsFiltered, eventBoundStart, eventBoundEnd) {
    var res = 0;

    _.forEach(dailyEventsFiltered, function (event) {
        var eventStart = moment(MOMENT_DATE_HELPER + event.startTime),
            eventEnd = moment(MOMENT_DATE_HELPER + event.endTime);

        if (eventStart.isBetween(eventBoundStart, eventBoundEnd, null, '[]') && eventEnd.isBetween(eventBoundStart, eventBoundEnd, null, '[]'))
            res++;
    });

    return res;
}

/**
 * View Function
 *
 * @param $container
 * @param calcCalendar
 */
function constructCalendar($container, calcCalendar) {
    var sdBodyObj = constructCalendarStructure($container, calcCalendar.dayIt, calcCalendar.structure);

    constructCalendarContent(sdBodyObj, calcCalendar.dayIt, calcCalendar.content)
}

/**
 * Construct the calendar structure
 *
 * @param $container jQuery
 * @param dayItObj
 * @param calcStructure
 * @returns {{jQuery}}
 */
function constructCalendarStructure($container, dayItObj, calcStructure) {
    var sdBodyObj = {};

    for (var dayIt = moment(dayItObj.start); dayIt.isSameOrBefore(dayItObj.end); dayIt.add(1, 'days')) {
        var dayStr = dayIt.format(ISO_DAY_FORMAT);
        sdBodyObj[dayStr] = constructDailyStructure($container, calcStructure.sdWidth, calcStructure.singleDays[dayStr]);
    }

    return sdBodyObj;
}

/**
 * Construct a single day element
 *
 * @param $container jQuery
 * @param sdWidth
 * @param name
 * @returns {jQuery}
 */
function constructDailyStructure($container, sdWidth, name) {
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

/**
 * Construct the calendar structure
 *
 * @param sdBodyObj {{jQuery}}
 * @param dayItObj
 * @param calcContent
 */
function constructCalendarContent(sdBodyObj, dayItObj, calcContent) {
    var sdBodyScale = calcContent.calcSingleDayBodyScale(sdBodyObj[dayItObj.start.format(ISO_DAY_FORMAT)]);

    for (var dayIt = moment(dayItObj.start); dayIt.isSameOrBefore(dayItObj.end); dayIt.add(1, 'days')) {
        var dayStr = dayIt.format(ISO_DAY_FORMAT),
            dailyEvents = calcContent.dailyContents[dayStr],
            $sdBody = sdBodyObj[dayStr];

        _.forEach(dailyEvents, function(event){
            buildSingleEvent($sdBody, event, sdBodyScale);
        });
    }
}

/**
 * Construct a single event
 *
 * @param $sdBody jQuery
 * @param event
 * @param sdBodyScale
 */
function buildSingleEvent($sdBody, event, sdBodyScale) {
    var div = $(document.createElement('div'));

    div.addClass("event");
    div.html(event.name);
    div.css({
        position:"absolute",
        top:event.fromDayStart * sdBodyScale,
        left: event.calcLeftPos($sdBody),
        width: event.width,
        height: (event.duration * sdBodyScale) + "px",
        'line-height': (event.duration * sdBodyScale) + "px"
    });

    $sdBody.append(div);
}