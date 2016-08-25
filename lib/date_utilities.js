(function() {
	var moment, Moment_Timezone;
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		moment = require('moment');
		Moment_Timezone = require('moment-timezone');
	}

	// Provides utilities for handling Dates
	var Date_Utilities = function() {	};

	// do two date objects represent the same date?
	Date_Utilities.prototype.same_date_as = function(date1, date2) {
		return ((date1.getFullYear()==date2.getFullYear())&&(date1.getMonth()==date2.getMonth())&&(date1.getDate()==date2.getDate()));
	};

	// add specified number of days to date 
	Date_Utilities.prototype.add_days = function(date, days) {
		date.setDate(date.getDate() + days);
		return date;
	};

	Date_Utilities.prototype.add = function(date, config) {
		if(typeof config=="number") {
			this._orient=config;
			return this;
		}

		var x=config;
		if(x.milliseconds){return this.add_milliseconds(date, x.milliseconds);}
		if(x.seconds){return this.add_seconds(date, x.seconds);}
		if(x.minutes){return this.add_minutes(date, x.minutes);}
		if(x.hours){return this.add_hours(date, x.hours);}
		if(x.weeks){return this.add_weeks(date, x.weeks);}
		if(x.months){return this.add_months(date, x.months);}
		if(x.years){return this.add_years(date, x.years);}
		if(x.days){return this.add_days(date, x.days);}
	};

	Date_Utilities.prototype.add_milliseconds = function(date, value) {
		date.setMilliseconds(date.getMilliseconds()+value);
		return date;
	};

	Date_Utilities.prototype.add_seconds = function(date, value) {
		return this.add_milliseconds(value*1000);
	};

	Date_Utilities.prototype.add_minutes = function(date, value) {
		return this.add_milliseconds(value*60000);
	};

	Date_Utilities.prototype.add_hours = function(date, value) { 
		return this.add_milliseconds(value*3600000);
	};

	Date_Utilities.prototype.add_weeks = function(date, value) {
		return this.add_days(date, value*7);
	};

	Date_Utilities.prototype.add_months = function(date, value) { 
		var n = date.getDate();
		date.setDate(1);
		date.setMonth(date.getMonth()+value);
		date.setDate(Math.min(n,this.get_days_in_month(date.getFullYear(),date.getMonth())));
		return date;
	};

	Date_Utilities.prototype.add_years = function(date, value) {
		return this.add_months(date, value*12);
	};

	Date_Utilities.prototype.get_days_in_month = function(year,month){
		return[31,(this.is_leap_year(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];
	};

	Date_Utilities.prototype.is_leap_year = function(year) { 
		return((year%4===0&&year%100!==0)||year%400===0);
	};

	Date_Utilities.prototype.clear_time = function(date) { 
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date;
	};

	Date_Utilities.prototype.clearTime = function() { 
		this.setHours(0);
		this.setMinutes(0);
		this.setSeconds(0);
		this.setMilliseconds(0);
		return this;
	};

	// this takes a time and adjusts it for the "current" timezone as indicated by timezone_info, passed in
	// this is useful for server-side operations where the time needs to be adjusted to a particular user's timezone
	// NOTE the fucking annoying complication here is that we can't just feed in an offset (like we were doing), because
	// the offset is unknown until you have the time, because the time may or may not be in Daylight Savings
	// for operations on the client, no adjustment should be necessary (in theory), so we assume we have the Moment_Timezone
	// node module to determine the adjustment for us
	Date_Utilities.prototype.adjusted_time = function(time, timezone_info) {
		if (!timezone_info || !timezone_info.name || typeof Moment_Timezone === 'undefined') {
			return time;
		}
		// here we get the offset based on the time in question and the timezone, and adjust again against the server's timezone
		// (again, taking into account the time in question)
		var timezone_offset = Moment_Timezone.tz.zone(timezone_info.name).offset(time);
		timezone_offset -= new Date(time).getTimezoneOffset(); // offset according to "server time"
		timezone_offset *= 60 * 1000;
		return time - timezone_offset;
	};

	// 
	// Public
	//
	// Date_Utilities.pretty_date();
	//
	// purpose: Return a human-readable date taking into account the current date
	// arguments: 
	//    time: seconds since 1970 on which to base the date
	// returns: a string to display, such as "today", "tomorrow", or "Nov 17"
	//
	Date_Utilities.prototype.pretty_date = function(time, options) {
		options = options || {};
		if (time === 0 || time === null || time === undefined)
			return '';
		var now = new Date().getTime();
		now = Date_Utilities.prototype.adjusted_time(now, options.timezone_info);
		time = Date_Utilities.prototype.adjusted_time(time, options.timezone_info);
		var today = new Date(now);
		var time_day = new Date(time);
		if (options.show_time_if_today) {
			if (Date_Utilities.prototype.same_date_as(time_day, today)) {
				return Date_Utilities.prototype.pretty_time(time, options);
			}
		}
		else if (!options.no_yesterday) {
			if (Date_Utilities.prototype.same_date_as(time_day, today)) {
				return 'today';
			}
			var next_day = Date_Utilities.prototype.add_days(new Date(time_day.getTime()), 1);
			if (Date_Utilities.prototype.same_date_as(next_day, today)) {
				return 'yesterday';
			}
			var previous_day = Date_Utilities.prototype.add_days(new Date(time_day.getTime()), -1);
			if (Date_Utilities.prototype.same_date_as(previous_day, today)) {
				return 'tomorrow';
			}
		}
		if (time_day.getFullYear() === today.getFullYear() && !options.force_year) {
			if (options.long_month) {
				return moment(time).format('MMMM D');
			}
			else {
				return moment(time).format('MMM D');
			}
		}
		if (options.long_month) {
			return moment(time).format('MMMM D, YYYY');
		}
		else {
			return moment(time).format('MMM D, YYYY');
		}
	};

	Date_Utilities.prototype.pretty_date_day = function(time, options) {
		options = options || {};
		if (time === 0 || time === null || time === undefined)
			return '';
		var now = new Date().getTime();
		now = Date_Utilities.prototype.adjusted_time(now, options.timezone_info);
		time = Date_Utilities.prototype.adjusted_time(time, options.timezone_info);
		var today = new Date(now);
		var time_day = new Date(time);
		if (!options.no_yesterday) {
			if (Date_Utilities.prototype.same_date_as(time_day, today)) {
				return 'today';
			}
			var next_day = Date_Utilities.prototype.add_days(new Date(time_day.getTime()), 1);
			if (Date_Utilities.prototype.same_date_as(next_day, today)) {
				return 'yesterday';
			}
			var previous_day = Date_Utilities.prototype.add_days(new Date(time_day.getTime()), -1);
			if (Date_Utilities.prototype.same_date_as(previous_day, today)) {
				return 'tomorrow';
			}
		}
		if (time_day.getFullYear() === today.getFullYear()) {
			return moment(time).format('ddd, MMM D');
		}
		return moment(time).format('ddd, MMM D, YYYY');
	};

	Date_Utilities.prototype.mmddyy = function(time, options) {
		options = options || {};
		if (time === 0 || time === null || time === undefined)
			return '';
		time = Date_Utilities.prototype.adjusted_time(time, options.timezone_info);
		return moment(time).format('M/D/YY');
	};

	Date_Utilities.prototype.pretty_timestamp_div = function(time, options) {
		var title = Date_Utilities.prototype.pretty_timestamp(time, options);
		var timestamp = Date_Utilities.prototype.pretty_date(time, {show_time_if_today: true});
		return '<div class="timestamp" title="' + title + '">' + timestamp + "</div>";
	};

	Date_Utilities.prototype.pretty_timestamp = function(time, options) {
		options = options || {};
		if (time === 0 || time === null || time === undefined)
			return '';
		var comp_time = time;
		var now = new Date().getTime();
		now = Date_Utilities.prototype.adjusted_time(now, options.timezone_info);
		comp_time = Date_Utilities.prototype.adjusted_time(comp_time, options.timezone_info);
		var timestamp = '';
		var today = new Date(now);
		var time_day = new Date(comp_time);
		if (!Date_Utilities.prototype.same_date_as(time_day, today)) {
			timestamp += Date_Utilities.prototype.pretty_date_day(time, {timezone_info: options.timezone_info, no_yesterday: true}) + ' ';
		}
		timestamp += Date_Utilities.prototype.pretty_time(time, options);
		return timestamp;
	};

	Date_Utilities.prototype.pretty_date_time = function(time, at, options) {
		return Date_Utilities.prototype.pretty_date(time, options) + (at ? ' at ' : ' ') +
			Date_Utilities.prototype.pretty_time(time, options);
	};

	Date_Utilities.prototype.pretty_date_day_time = function(time, at, options) {
		return Date_Utilities.prototype.pretty_date_day(time, options) + (at ? ' at ' : ' ') +
			Date_Utilities.prototype.pretty_time(time, options);
	};

	Date_Utilities.prototype.pretty_time_short = function(time, options) {
		options = options || {};
		time = Date_Utilities.prototype.adjusted_time(time, options.timezone_info);
		return moment(time).format('h:mmA').toLowerCase();
	};

	Date_Utilities.prototype.pretty_time = function(time, options) {
		options = options || {};
		var pretty_time;
		time = Date_Utilities.prototype.adjusted_time(time, options.timezone_info);
		pretty_time = moment(time).format('h:mm A');
		pretty_time = pretty_time.replace(/^0:/, '12:');
		return pretty_time;
	};

	// given two times (passed as miliseconds since 1970) return
	// the number of business days in between
	Date_Utilities.prototype.business_days = function(time1, time2) {
		var date1 = new Date(parseInt(time1, 10));
		date1.setHours(0,0,0,0);
		var date2 = new Date(parseInt(time2, 10));
		date2.setHours(0,0,0,0);

		// failsafe so that we don't loop forever
		if (date1 >= date2)
			return 0;

		var business_days = 0;
		while (date1 < date2) {
			Date_Utilities.prototype.add_days(date1, 1);
			var day_of_week = date1.getDay();
			if (day_of_week !== 0 && day_of_week !== 6)
				business_days++;
		}
		// pez("RETURNING days: " + business_days);
		return business_days;
	};

	// given a time (passed as miliseconds since 1970) return
	// a new time represented that many business days forward
	Date_Utilities.prototype.add_business_days = function(time, days) {
		// avoid infinite loop
		if (days < 0)
			return time;

		var date = new Date(parseInt(time, 10));
		// date.setHours(0,0,0,0);
		while (days) {
			Date_Utilities.prototype.add_days(date, 1);
			var day_of_week = date.getDay();
			if (day_of_week !== 0 && day_of_week !== 6)
				days--;
		}
		return date.getTime();
	};

	// nice date/time timestamp without reference to today, tomorrow, etc.
	Date_Utilities.prototype.pretty_datetime_without_now = function(time, options) {
		options = options || {};
		var date_time = time;
		date_time = Date_Utilities.prototype.adjusted_time(date_time, options.timezone_info);
		return moment(date_time).format('ddd, MMM D') + ' ' + Date_Utilities.prototype.pretty_time(time, options);
	};

	Date_Utilities.prototype.parse_time = function(time) {
		var hour = 0, minute = 0, am_pm = 0;
		time = time.trim();
		var second_chance_time = time;
		if (time.match(/pm?$/i)) {
			time = time.replace(/pm?$/i, '').trim();
			am_pm = 1;
		}
		var matches = time.match(/^([01]?\d|2[0-3]):?([0-5]\d)/);
		if (matches && matches.length) {
			hour = matches[1] * 1;
			minute = matches[2] * 1;
		}
		else {
			matches = second_chance_time.match(/^(\d+)(a|p)m?$/i);
			if (matches && matches.length) {
				hour = matches[1] * 1;
				minute = 0;
				console.log("HOUR IS: " + hour);

				if (hour <= 0 || hour > 12)
					return false;
			}
			else {
				return false;
			}
		}
		if (hour === 12)
			hour = 0;
		var seconds = (((am_pm * 12) + hour) * 60 + minute) * 60;
		if (isNaN(seconds)) return false;
		else return seconds * 1000;
	};

	// parse a date, have to write this ourselves because Date js SUCKS
	Date_Utilities.prototype.parse_date = function(date) {
					// NOTE - this assumes mm/dd/yy(yy) - it is CULTURE-SPECIFIC!
					var matches = date.match(/^(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/(\d{2}|\d{4})$/);
					if (!matches || matches.length !== 4) return false;
					var month = matches[1] - 1;
					var day = matches[2] * 1;
					var year = matches[3] * 1;
					if (month > 11) return false;
					if (year < 100) year += 2000;
					if (day > this.getDaysInMonth(year, month)) return false;
					return (new Date(year, month, day)).getTime();
	};

	Date_Utilities.prototype.getDaysInMonth = function(year,month) {
		return[31,(Date_Utilities.prototype.isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];
	};

	Date_Utilities.prototype.isLeapYear = function(year) {
		return((year%4===0&&year%100!==0)||year%400===0);
	};

	Date_Utilities.prototype.ago = function(time) {
		if (time === 0 || time === null || time === undefined)
			return '';
		var now = new Date();
		var difference = (now.getTime() - time) / 1000; // seconds difference
		if (difference < 60)
			return loc('seconds ago');
		if (difference < 120)
			return loc('a minute ago');
		if (difference < 3600)
			return loc('[_minutes] minutes ago', { minutes: Math.floor(difference / 60)});
		if (difference < 7200)
			return 'an hour ago';
		if (difference < 3600 * 24)
			return loc('[_hours] hours ago', { hours: Math.floor(difference / 3600)});
		if (difference < 7200 * 24)
			return 'a day ago';
		return loc('[_days] days ago', { days: Math.floor(difference / (3600 * 24))});
	};

	Date_Utilities.prototype.normalize = function($input) {
		var val = $input.val();
		var new_val = val.replace('-','/').replace('.','/').replace('\\','/');
		var matches = val.match(/^(\d+)\/(\d+)$/);
		if (matches) {
			new_val = 
				parseInt(matches[1]).toString() + '/' + 
				parseInt(matches[2]).toString() + '/' + 
				(new Date).getFullYear().toString().substr(2,2);
		}
		if (!new_val) {
			matches = val.match(/^(\d+)\/(\d+)\/(\d+)$/);
			if (matches) {
				if (matches[3].length === 2 || matches[3].length === 4) {
					new_val = 
						parseInt(matches[1]).toString() + '/' + 
						parseInt(matches[2]).toString() + '/' + 
						(matches[3].length === 4 ? matches[3].substr(2,2) : matches[3]);
				}
			}
		}
		if (new_val) {
			$input.val(new_val);
		}
	};

	// 0:15, 5:15, 1:05:15
	Date_Utilities.prototype.phone_duration_pretty = function(ms, leading_zero) {
		var ms_per_hr = 3600000;
		var ms_per_min = 60000;
		var ms_per_sec = 1000;
		var hours = Math.floor(ms / ms_per_hr);
		var minutes = Math.floor((ms - (hours * ms_per_hr)) / ms_per_min);
		var seconds = Math.floor((ms - (hours * ms_per_hr) - (minutes * ms_per_min)) / ms_per_sec);
		var hours_str = hours.toString();
		if (minutes < 10 && (hours > 0 || leading_zero)) { minutes = "0" + minutes; }
		if (seconds < 10) { seconds = "0" + seconds; }
		return (hours > 0 ? hours_str + ":" : "") + minutes + ":" + seconds;
	};

	// 00:15, 05:15, 01:05:15
	Date_Utilities.prototype.duration_pretty = function(ms) {
		var ms_per_hr = 3600000;
		var ms_per_min = 60000;
		var ms_per_sec = 1000;
		var hours = Math.floor(ms / ms_per_hr);
		var minutes = Math.floor((ms - (hours * ms_per_hr)) / ms_per_min);
		var seconds = Math.floor((ms - (hours * ms_per_hr) - (minutes * ms_per_min)) / ms_per_sec);
		var hours_str = hours < 10 ? "0" + hours : hours.toString();
		if (minutes < 10) { minutes = "0" + minutes; }
		if (seconds < 10) { seconds = "0" + seconds; }
		return (hours > 0 ? hours_str + ":" : "") + minutes + ":" + seconds;
	};

	Date_Utilities.prototype.timestamp_from_date = function(date_string) {
		return (new Date(date_string)).getTime();
	};

	// Given a timestamp, set the hours to noon relative to the local timezone
	Date_Utilities.prototype.set_timestamp_to_noon = function(timestamp) {
		var new_date = new Date(timestamp);
		new_date.setHours(12,0,0,0);
		return new_date.getTime();
	};

	Date_Utilities.prototype.node_yyyymmdd = function(time, separator) {
		time = time ? time : +new Date();
		separator = separator ? separator : '';
		var date = new Date(time);
		var day = date.getDate();
		day = day < 10 ? '0' + day : "" + day;
		var month = date.getMonth();
		month++;
		month = month < 10 ? '0' + month : "" + month;
		return [date.getFullYear(), month, day].join(separator);
	};

	// Returns unix timestamp in milliseconds for midnight of yesterdayday in *current timezone*
	Date_Utilities.prototype.node_yesterday_mills = function() {
		return this.add_days_to_mills(this.node_today_mills(), -1);
	};

	// Returns unix timestamp in milliseconds for midnight of day in *current timezone*
	Date_Utilities.prototype.node_today_mills = function() {
		var today = new Date();	
		return +new Date(today.toLocaleDateString());
	};

	Date_Utilities.prototype.mills_from_yyyymmdd = function(day) {
		var date = new Date(day);
		var offset_mills = date.getTimezoneOffset()*60000;
		return ((+date) + offset_mills);
	};

	// Adds exactly one or more days to the provided milliseconds
	Date_Utilities.prototype.add_days_to_mills = function(day_mills, days) {
		var date = new Date(day_mills);
		date.setDate(date.getDate() + days);
		return +date;
	};

	Date_Utilities.prototype.date_range_from_dates = function(start_yyyymmdd, end_yyyymmdd) {
			var range_start = this.mills_from_yyyymmdd(start_yyyymmdd),
				range_end   = this.mills_from_yyyymmdd(end_yyyymmdd);
		return this.date_range_from_mills(range_start, range_end);
	};

	Date_Utilities.prototype.date_range_from_mills = function(start_yyyymmdd, end_yyyymmdd) {
			var range_start = start_yyyymmdd || this.node_yesterday_mills(),
					range_end   = end_yyyymmdd || this.node_today_mills(),
				my_ranges = []; 

		// Short blocking operation to determine how many day length date ranges we want to
		// iteratre over.  By default we look only at the past day.  Command line arguments
		// can change which range we work over.
		while (range_start < range_end) {
			var next_day = this.add_days_to_mills(range_start, 1);
			my_ranges.push({
				start: range_start, 
				end:   next_day
			});
			// console.log("Adding range " + new Date(range_start) + " (" + range_start + ") - " + new Date(end) + " (" + end + ")");
			range_start = next_day; 
		}
		return my_ranges;
	};

	Date_Utilities.prototype.format_time_selection = function(time) {
		// ie11 adds invisible characters to date strings... so we strip them out here
		time = time.toLocaleTimeString().replace(/[^\w\s:]/g, '').toLowerCase();
		// strip timezone from safari date display
		var match = time.match(/^(\d+:\d+:\d+)\s*(am|pm)?(.*)/);
		if (!match || !match[1]) { return ''; } // failsafe
		// remove trailing seconds from a time string
		time = match[1].replace(/:\d{2}$/, '') + (match[2] ? (' ' + match[2]) : '');
		return time;
	};

	// adjust the passed date timestamp and passed time representing number of milliseconds into the day, based on the possibility
	// that the day may be a day on which DST changes
	Date_Utilities.prototype.combine_date_time = function(date_ms, time_ms) {
		var no_time_change = new Date('1/1/70').getTime();
		var time_change_adjust = 60 * 60 * 1000 *
			(new Date(date_ms + time_ms).getHours() - new Date(no_time_change + time_ms).getHours());
		return date_ms + time_ms - time_change_adjust;
	};

	// parse a date and time into a timestamp, taking into account the possibility that the date may be a day on which there is 
	// a change in DST
	Date_Utilities.prototype.parse_date_time = function(date, time) {
		if (!date) { return null; }
		var date_ms = Date_Utilities.prototype.parse_date(date);
		if (!date_ms) {
			console.warn('invalid date: ' + date);
			return null;
		}
		var time_ms = 0;
		if (time) {
			time_ms = Date_Utilities.prototype.parse_time(time);
			if (!time_ms) {
				console.warn('invalid time: ' + time);
				time_ms = 0;
			}
		}
		return Date_Utilities.prototype.combine_date_time(date_ms, time_ms);
	};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		exports.Date_Utilities = Date_Utilities;
	}
	else {
		window.Date_Utilities = Date_Utilities;
	}
})();
