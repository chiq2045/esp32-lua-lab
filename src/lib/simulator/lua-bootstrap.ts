export const LUA_BOOTSTRAP = `
local LED = {}
LED.__index = LED

function LED:turnOn()
  __setLED(self.name, true)
  self.state = 1
end

function LED:turnOff()
  __setLED(self.name, false)
  self.state = 0
end

function LED:isOn()
  return self.state == 1
end

local Button = {}
Button.__index = Button

function Button:isPressed()
  return __isPressed(self.name)
end

local function createLED(name)
  return setmetatable({
    name = name,
    state = 0
  }, LED)
end

local function createButton(name)
  return setmetatable({
    name = name
  }, Button)
end

function wait(seconds)
  __scheduleWait(seconds or 0.02)
  coroutine.yield()
end

-- Components are supplied by the Design tab.
for name, kind in pairs(__components) do
  if kind == "led" then
    _G[name] = createLED(name)
  elseif kind == "button" then
    _G[name] = createButton(name)
  end
end

__components = nil
`;
