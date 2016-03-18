start =
  hello
  / gcode_state_message
  / gcode_coordinate_message
  / tool_length_offset_message
  / probe_message
  / text_message
  / report
  / status
  / setting


/*
Atoms are here.
*/
number =
  [\+\-]?[0-9]+([\.][0-9]*)? {return parseFloat(text());}
  
true = 
  "1" {return true}
  
false = 
  "0" {return false}

rest =
  .* {return text();}

version =
  ([0-9\.a-z])+ {return text();}

idle =
  "Idle" {return {status: 'idle'}}

run =
  "Run" {return {status: 'run'}}

hold =
  "Hold" {return {status: 'hold'}}

home =
  "Home" {return {status: 'home'}}

alarm =
  "Alarm" {return {status: 'alarm'}}

check =
  "Check" {return {status: 'check'}}

door =
  "Door" {return {status: 'door'}}
  
reset = 
  "[Reset to continue]" {return 'reset to continue'}

unlock = 
  "['$H'|'$X' to unlock]" {return "home or unlock"}

unlocked = 
  "[Caution: Unlocked]" {return ""}
  
enabled = 
  "[Enabled]" {return "enabled"}
  
disabled = 
  "[Disabled]" {return "disabled"}
  
end = 
  "[Pgm End]" {return "program end"}
  
restore = 
  "[Restoring defaults]" {return ""}

/*
Compounds are here.
*/
state =
  idle 
  / run 
  / hold 
  / home 
  / alarm 
  / check 
  / door
  
boolean = 
 r:true
 / r:false
 {return r}

position =
  x:number "," y:number "," z:number
  {return {x, y, z}}

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
  "MPos:" p:position
  {return {machine_position: p}}

work_position =
  "WPos:" p:position
  {return {work_position: p}}
  
g_word = 
  "G" x:number
  {return text();}

m_word = 
  "M" x:number
  {return text();}
  
t_word = 
  "T" x:number
  {return text();}
  
f_word = 
  "F" x:number
  {return text();}
  
s_word = 
  "S" x:number
  {return text();}
  
any_word = 
  g_word
  / m_word
  / t_word
  / f_word
  / s_word


ok_message =
  "ok" {return {action: 'grbl_ok', message: ''}}

error_message =
  "error: " message:rest {return {action: 'grbl_error', message}}

alarm_message =
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
      action: 'grbl_hello',
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
     action: 'grbl_report',
     state
   }
 }

//Current state of the GCODE parser, this lets you know the work
//coordinates as well as the coordinate plane and units
gcode_state_message = 
  "["
  word:any_word
  words:(" " word:any_word {return word})*
  "]"
  {
    let flags = {};
    flags[word] = true;
    words.forEach((word) => {
      flags[word] = true;
    });
    return {
      action: 'grbl_feedback',
      state: {
        flags
      }
    }
  }
 
//coordinates for machine offsets
gcode_coordinate_message = 
  "[" register:g_word ":" p:position "]"
  {
    let ret = {action: 'grbl_feedback', state: {}};
    ret.state[register] = p;
    return ret;
  }
  
//amount of tool offset  
tool_length_offset_message = 
  "[" "TLO" ":" offset:number "]"
  {
    return {
      action: 'grbl_feedback',
      state: { 
        TLO: offset
      }
    }
  }
  
probe_message = 
  "[" "PRB" ":" offset:position ":" success:boolean "]"
  {
    return {
      action: 'grbl_feedback',
      state: { 
        PRB: offset
      }
    }
  }
  
text_message = 
  message:(
    reset 
  / unlock 
  / unlocked 
  / enabled 
  / disabled
  / end
  / restore
  )
  {
    return {
      action: 'grbl_feedback',
      message: message
    }
  }

//status messages coming in while commands are running
status =
  ok_message
  / error_message
  / alarm_message


setting = 
  "$" setting:number "=" value:number " " description:rest
  {
    return {
      action: 'grbl_setting',
      setting,
      value,
      description
    }
  }