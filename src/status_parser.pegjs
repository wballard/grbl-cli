start =
  report


/*
Atoms are here.
*/
number =
  [\+\-]?[0-9]+([\.][0-9]+)? {return parseFloat(text());}

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
Status message statements are here
*/
report =
 "<"
 state:state
 values:("," value:named_value {return value})*
 ">"
 {
   //flatten down into name:value rather than
   //as an array of named values
   return values.reduce((prior, current) => {
     return Object.assign(prior, current);
   }, state);
 }
