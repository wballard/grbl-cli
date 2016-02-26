start =
  hello
  / feedback
  / report
  / status


/*
Atoms are here.
*/
number =
  [\+\-]?[0-9]+([\.][0-9]+)? {return parseFloat(text());}

rest =
  .* {return text();}

message =
  [^\]]* {return text();}

version =
  ([0-9\.a-z])+ {return text();}

idle =
  "Idle" {return {idle: true}}

run =
  "Run" {return {run: true}}

hold =
  "Hold" {return {hold: true}}

home =
  "Home" {return {home: true}}

alarm =
  "Alarm" {return {alarm: true}}

check =
  "Check" {return {check: true}}

door =
  "Door" {return {door: true}}



/*
Compounds are here
*/
state =
  idle / run / hold / home / alarm / check / door

position =
  x:number "," y:number "," z:number
  {return {x, y, z};}

control_pin =
  "Ctl:" x:number
  {return {control_pin: x}}

limit_pin =
  "Lim:" x:number
  {return {limit_pin: x}}

feed_rate =
  "F:" x:number
  {return {feed_rate: x}}

line_number =
  "Ln:" x:number
  {return {line_number: x}}

read_buffer =
  "RX:" x:number
  {return {read_buffer: x}}

planner_buffer =
  "Buf:" x:number
  {return {planner_buffer: x}}

machine_position =
  "MPos:" x:position
  {return {machine_position: x}}

work_position =
  "WPos:" x:position
  {return {work_position: x}}


ok =
  "ok" {return {action: 'grbl_ok', message: ''}}

error =
  "error: " message:rest {return {action: 'grbl_error', message}}

alarm =
  "ALARM: " message:rest {return {action: 'grbl_alarm', message}}

named_value =
  control_pin
  / limit_pin
  / feed_rate
  / line_number
  / read_buffer
  / planner_buffer
  / machine_position
  / work_position


/*
Status message statements are here.
*/

//not much to see here, just pop back a version number
hello =
  "Grbl"
  " "
  version:version
  rest:rest
  {
    return {
      action: 'hello',
      version: version
    }
  }

//this reports current state and position of the machine
report =
 "<"
 state:state
 values:("," value:named_value {return value})*
 ">"
 {
   //flatten down into name:value rather than
   //as an array of named values
   state = values.reduce((prior, current) => {
     return Object.assign(prior, current);
   }, state);
   return {
     action: 'report',
     state
   }
 }

//feeback report, contains other feedback which is just to display
feedback =
  "["
  message:message
  "]"
  {
    return {
      action: 'feedback',
      message: message
    }
  }

//status messages coming in while commands are running
status =
  ok
  / error
  / alarm
