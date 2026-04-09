# Toggle sit state via tag
execute if entity @s[tag=miku_sitting] run event entity @s miku:stop_sitting
execute if entity @s[tag=miku_sitting] run tag @s remove miku_sitting
execute unless entity @s[tag=miku_sitting] run event entity @s miku:start_sitting
execute unless entity @s[tag=miku_sitting] run tag @s add miku_sitting
