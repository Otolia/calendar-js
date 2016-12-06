/**
 * Created by amauryconstant on 04/12/2016.
 */

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

    console.log(startCal, endCal);

    var sdObj = {};

    buildCalendarStructure($container, startCal, sdObj);

    console.log(sdObj);
}

/**
 * Build the 7 days calendar structure (without data) and fill the sdObj with the jQuery of each single column
 *
 * @param $container
 * @param startCal
 * @param sdObj
 */
function buildCalendarStructure($container, startCal, sdObj) {
    var dateIt = moment(startCal),
        i = 0;

    while (i < 7) {
        sdObj[dateIt.format('YYYY-MM-DD')] = buildSingleDayDiv($container, dateIt);
        dateIt.add(1, 'days');
        i++;
    }
}

/**
 * Build a column for a single day and return its representation in jQuery
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

    return $(dayDiv);
}