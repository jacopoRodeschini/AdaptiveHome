
from machine import Pin
import time
import network
import urequests
from machine import Pin
import ujson
ApyKey = "13cb7435-d956-451c-834e-b2c0afdef600"
url = "http://dry-island-85561.herokuapp.com/hardware/getRoutines/"

# device class:
# @function: funzione adaptiveHome associata
# @pin: istance of machine.pin -> I/O device
class device:
    def __init__(self,function,pin_):
        self.function = function
        self.pin = Pin(pin_,Pin.OUT)

    def setState(self, value):
        if value == True:
            self.pin.on()
        if value == False:
            self.pin.off()

print("Author: ADAPTIVEHOME.org")
print("Start config IOT device")
print("..")
# define user-function (export from adaptiveHome)
fun = ["F01"]

# define user pin match function
userPin = [2]

# define list of device
ListDevice = {}
i = 0;
if len(fun) == len(userPin):
    for f in fun:
        ListDevice[f] = device(f, userPin[0])
        i = i + 1;

# conncetion to wifi-network
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.scan()
if not wlan.isconnected():
    wlan.connect('Honor 10', '123456789')
    while not wlan.isconnected():
        print("...")
        pass


while(True):

    res = urequests.get(url+ApyKey)
    data = ujson.loads(res.text)
    print(data)
    for dt in data:
        try:
            ListDevice[dt['function']].setState(dt['current_value'])
            print(dt['current_value'])
        except KeyError:
            pass

    time.sleep(10) # sleep for 15 900 min