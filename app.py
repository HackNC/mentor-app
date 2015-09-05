from autobahn.twisted.websocket import WebSocketServerFactory
import sys
from twisted.python import log
from twisted.internet import reactor
from MentorProtocol import MentorProtocol
from Utils import Utils

if __name__ == '__main__':

    log.startLogging(sys.stdout)

    factory = WebSocketServerFactory(u"ws://127.0.0.1:9000", debug=False)
    factory.protocol = MentorProtocol

    #This user will debug to console, but spoof a normal websocket user
    debug = Utils.DebugUser()

    groups = {
    "mentors" : Utils.Group("mentors"),
    "users" : Utils.Group("users")
    }

    Utils.iUtils = Utils.utils(groups)

    Utils.iUtils.getGroup("mentors").addMember(Utils.DebugUser())

    reactor.listenTCP(9000, factory)
    reactor.run()