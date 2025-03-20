#define OUTPUT_AD8323 15
#define LO_MINUS  23
#define LO_PLUS 22

// #define OUTPUT_AD8323 A0
// #define LO_MINUS  11
// #define LO_PLUS 10


void setup() {
  // initialize the serial communication:
  Serial.begin(115200);
  pinMode(LO_PLUS, INPUT); // Setup for leads off detection LO +
  pinMode(LO_MINUS, INPUT); // Setup for leads off detection LO -
  pinMode(OUTPUT_AD8323, INPUT); 
}

void loop() {
  
  if((digitalRead(LO_PLUS) == 1)||(digitalRead(LO_MINUS) == 1)){
    Serial.println('!');
  }
  else{
    // send the value of analog input 0:
      Serial.println(analogRead(OUTPUT_AD8323));
  }
  //Wait for a bit to keep serial data from saturating
  delay(1);
}