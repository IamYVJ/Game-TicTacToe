from random import choice
import math

def check_winner(grid, default_value):
    for i in range(3):
        if grid[i][0]==grid[i][1]==grid[i][2]!=default_value:
            return grid[i][0]
        if grid[0][i]==grid[1][i]==grid[2][i]!=default_value:
            return grid[0][i]
    if grid[0][0]==grid[1][1]==grid[2][2]!=default_value:
        return grid[0][0]
    if grid[0][2]==grid[1][1]==grid[2][0]!=default_value:
        return grid[2][0]
    return default_value

def game_over(grid, default_value):
    flag = True
    for i in range(3):
        for j in range(3):
            if grid[i][j]==default_value:
                flag = False
                break
    return flag

def init_grid(default_value = 0):
    return [
        [default_value, default_value, default_value],
        [default_value, default_value, default_value],
        [default_value, default_value, default_value]
    ]

def calculate_score(grid, player, opponent, players_chance, default_value):
    result = check_winner(grid, default_value)
    if result==player:
        return 1
    elif result==opponent:
        return -1
    elif game_over(grid, default_value):
        return 0
    best_score = -math.inf if players_chance else math.inf
    for i in range(3):
        for j in range(3):
            if grid[i][j]==default_value:
                grid[i][j]= player if players_chance else opponent
                score = calculate_score(grid, player, opponent, not players_chance, default_value)
                if players_chance:
                    best_score = max(best_score, score)
                else:
                    best_score = min(best_score, score)
                grid[i][j] = default_value
    return best_score

def best_move(grid, player, opponent, players_chance, default_value):
    best_score, best_moves = -math.inf if players_chance else math.inf, []
    for i in range(3):
        for j in range(3):
            if grid[i][j]==default_value:
                grid[i][j] = player if players_chance else opponent
                score = calculate_score(grid, player, opponent, not players_chance, default_value)
                if players_chance:
                    if score>best_score:
                        best_score = score
                        best_moves =[[i,j]]
                    elif score==best_score:
                        best_moves.append([i,j])
                else:
                    if score<best_score:
                        best_score = score
                        best_moves =[[i,j]]
                    elif score==best_score:
                        best_moves.append([i,j]) 
                grid[i][j] = default_value
    # print(best_moves)
    return choice(best_moves)

grid = init_grid()
# print(best_move(grid, 1, 2, True, 0))


