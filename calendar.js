/**
 * Created by amauryconstant on 04/12/2016.
 */

const ISO_DAY_FORMAT = 'YYYY-MM-DD';
const READABLE_DAY_FORMAT = 'dddd DD';

/**
 * Single call function handling the construction of the complete 7 days calendar
 *
 * @param $container
 * @param calObj
 */
function buildCalendar($container, calObj) {
    console.log(calObj);

    var startCal = moment(calObj.from);
    var endCal = moment(calObj.to);

    var sdBodyObj = {};

    buildCalendarStructure($container, startCal, sdBodyObj);

    sdBodyObj.height = sdBodyObj[startCal.format('YYYY-MM-DD')].height();

    placeEvents(sdBodyObj, calObj);

    //# Refactor below

    var calcCalendar = {};

    calcCalendar.structure = calcCalendarStructure(calObj);

    console.log(calcCalendar);
}

/**
 * Build the 7 days calendar structure (without data) and fill the sdObj with the jQuery of each single column
 *
 * @param $container
 * @param startCal
 * @param sdBodyObj
 */
function buildCalendarStructure($container, startCal, sdBodyObj) {
    var dateIt = moment(startCal),
        i = 0;

    while (i < 7) {
        sdBodyObj[dateIt.format('YYYY-MM-DD')] = buildSingleDayDiv($container, dateIt);
        dateIt.add(1, 'days');
        i++;
    }
}

/**
 * Build a column for a single day and return the representation of its body element in jQuery
 *
 * @param $container jQuery
 * @param day moment
 * @returns {jQuery}
 */
function buildSingleDayDiv($container, day) {
    var dayDiv = document.createElement('div');
    dayDiv.className = 'single-day';

    var dayDivHeader = document.createElement('div');
    dayDivHeader.className = 'sd-header';
    dayDivHeader.innerHTML = day.format('dddd DD');
    dayDiv.appendChild(dayDivHeader);

    var dayDivBody = document.createElement('div');
    dayDivBody.className = 'sd-body';
    dayDiv.appendChild(dayDivBody);

    $container.append(dayDiv);

    return $(dayDivBody);
}

function placeEvents(sdBodyObj, calObj) {
    var dayStart = moment("2000-01-01 " + calObj.dayStartTime),
        dayEnd = moment("2000-01-01 " + calObj.dayEndTime),
        dayBounds = {start: dayStart, end: dayEnd},
        dayDuration = dayEnd.diff(dayStart, 'minutes'),
        sdBodyScale = sdBodyObj.height / dayDuration;

    console.log(dayDuration, sdBodyScale);

    for (var i = 0; i < calObj.events.length; i++) {
        var event = calObj.events[i],
            sdBody = sdBodyObj[event.date];

        placeSingleEvent(event, sdBody, dayBounds, sdBodyScale);
    }
}

function placeSingleEvent(event, sdBody, dayBounds, sdBodyScale) {
    var div = $(document.createElement('div')),
        eventStart = moment("2000-01-01 " + event.startTime),
        eventEnd = moment("2000-01-01 " + event.endTime),
        eventDuration = eventEnd.diff(eventStart, 'minutes'),
        dayElapsed = eventStart.diff(dayBounds.start, 'minutes');

    div.addClass("event");
    div.html(event.name);
    div.css({position:"absolute", top:dayElapsed * sdBodyScale, width: "100%", height: (eventDuration * sdBodyScale) + "px"});

    sdBody.append(div);
}

//# Refactor below

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

    calStruct.sdWidth = _.round(100 / calStruct.nbCol, 3) + 'px';

    calStruct.singleDays = [];
    for (var dayIt = moment(startCal); dayIt.isSameOrBefore(endCal); dayIt.add(1, 'days')) {
        calStruct.singleDays.push(dayIt.format(READABLE_DAY_FORMAT));
    }

    return calStruct;
}
