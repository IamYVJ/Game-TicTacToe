from random import choice

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

def check_winning_move(grid, player, default_value):
    for i in range(3):
        for j in range(3):
            if grid[i][j]==default_value:
                grid[i][j] = player
                if check_winner(grid, default_value)==player:
                    grid[i][j] = default_value
                    return [i, j]
                grid[i][j] = default_value
    return False

def init_grid(default_value = 0):
    return [
        [default_value, default_value, default_value],
        [default_value, default_value, default_value],
        [default_value, default_value, default_value]
    ]

def calculate_moves(grid, player, opponent, players_chance, default_value):
    winnings, losses = 0, 0
    for i in range(3):
        for j in range(3):
            if grid[i][j]==default_value:
                grid[i][j]= player if players_chance else opponent
                result = check_winner(grid, default_value)
                if result==player:
                    winnings+=1
                elif result==default_value:
                    twin, tloss = calculate_moves(grid, player, opponent, not players_chance, default_value)
                    winnings+=twin
                    losses+=tloss
                else:
                    losses+=1
                grid[i][j] = default_value
    return [winnings, losses]

def calculate_best_move(grid, player, opponent, default_value):
    max_winnings = -1
    winning_moves = []
    for i in range(3):
        for j in range(3):
            if grid[i][j]==default_value:
                grid[i][j] = player
                winnings, losses = calculate_moves(grid, player, opponent, False, default_value)
                # print(winnings, losses, round(winnings/losses*100,2), end='|')
                if winnings>max_winnings:
                    max_winnings = winnings
                    winning_moves =[[i,j]]
                elif winnings==max_winnings:
                    winning_moves.append([i, j])
                grid[i][j] = default_value
            else:
                # print('   |', end='')
                pass
        # print()
    return choice(winning_moves)

def best_move(grid, player, opponent, default_value):

    # Check if player can win
    value = check_winning_move(grid, player, default_value)
    if value!=False:
        return value

    # Check if opponent can win
    value = check_winning_move(grid, opponent, default_value)
    if value!=False:
        return value

    return calculate_best_move(grid, player, opponent, default_value)



grid = init_grid()
# print(best_move(grid, 1, 2, 0))
print(calculate_best_move(grid, 1, 2, 0))


