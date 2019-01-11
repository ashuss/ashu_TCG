package ashwini.src.main.java.com.cg.simulator.dto;


import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Properties;

public class RPMCount {
static int count = 0;
static int currentCount = 0;
static long time1 = System.currentTimeMillis();
static int sensorPin = 2;
static long timeout = 5000;

public static void main(String[] args) {

Properties properties = new Properties();
try {
File file = new File("config.properties");
FileInputStream fileInput = new FileInputStream(file);
properties.load(fileInput);
fileInput.close();
} catch (FileNotFoundException e) {
e.printStackTrace();
} catch (IOException e) {
e.printStackTrace();
}

sensorPin = Integer.parseInt(properties.getProperty("sensorPin"));
timeout = Long.parseLong(properties.getProperty("timeout"));

final GpioController gpio = GpioFactory.getInstance();

final GpioPinDigitalInput myButton = gpio
.provisionDigitalInputPin(RaspiPin.GPIO_02);

myButton.setShutdownOptions(true);

myButton.addListener(new GpioPinListenerDigital() {
@Override
public void handleGpioPinDigitalStateChangeEvent(
GpioPinDigitalStateChangeEvent event) {
// display pin state on console
System.out.println(" --> GPIO PIN STATE CHANGE: "
+ event.getPin() + " = " + event.getState());
long timediff = System.currentTimeMillis() - time1;
if (timediff<=timeout){
count++;
}else{
currentCount = count;
count = 0;
time1 = System.currentTimeMillis();
calculateRPM(currentCount, timeout);
}

}
}); 
while (true) {
}
}

public static void calculateRPM(int currentCount, Long time) {
BufferedWriter out = null;
//double timeLimit = Double.parseDouble(time);

double rpm = ((currentCount * 1000) / time) * 60;

int rpm1 = (int) rpm;
String writeToFile = new Integer(rpm1).toString();
System.out.println(writeToFile);
try {
out = new BufferedWriter(new FileWriter("rpm.txt"));
out.write(writeToFile);
} catch (IOException e) {
e.printStackTrace();
} finally {
try {
if (out != null) {
out.flush();
out.close();
} else {
System.out.println("Buffer has not been initialized!");
}
} catch (IOException e) {
e.printStackTrace();
}
}
}

}
