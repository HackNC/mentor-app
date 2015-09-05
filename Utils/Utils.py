import json

iUtils = None

#Takes message OBJECT , not string
def handleMessage(msg, conn):
    mtype = msg.getType()

    if mtype == "help":
        #new logic
        print("new help request")
        #create user object
        u = User(conn, msg.getUID())
        #Add the user to the group list
        iUtils.getGroup('users').addMember(u)
        #Forward the message to the Mentors group

    elif mtype == "newmentor":
        #newmentor logic
        print("mentor regitration")
        #create group object
        u = User(conn, msg.getUID())
        iUtils.getGroup("mentors").addMember(u)

        print("mentor list now consists of...")
        iUtils.getGroup("mentors").sendAll("new member registered!")

class utils:

    def __init__(self, groupDict):
        self.groups = groupDict

    def getGroup(self, groupName):
        return self.groups[groupName]

    def getAllGroups(self):
        return self.groups

class Group:

    def __init__(self, name):
        self.name = name
        self.members = []

    def addMember(self, member):
        self.members.append(member)

    def sendAll(self, message):
        for m in self.members:
            m.send(message)

    def removeMember(self, member):
        m.remove(member)


class User:

    def __init__(self, ws, uid):
        self.ws = ws
        self.uid = uid

    def send(self, message):
        self.ws.sendMessage(message.encode('utf8'))

class DebugUser:

    def send(self, message):
        print("Debug user says %s" % message)

class Message:

    def __init__(self, message):
        self.msg = message
        self.json = json.loads(self.msg)

    def getType(self):
        return self.json['type']

    def getContent(self):
        return self.json['body']

    def getUID(self):
        return self.json['uid']


