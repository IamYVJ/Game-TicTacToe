from minimax import best_move, game_over, check_winner
import json

def write_json(filename, data):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(json.dumps(data))

def generate_all_possibilities():
    all_best_moves = {}
    for p00 in range(3):
        for p01 in range(3):
            for p02 in range(3):
                for p10 in range(3):
                    for p11 in range(3):
                        for p12 in range(3):
                            for p20 in range(3):
                                for p21 in range(3):
                                    for p22 in range(3):
                                        grid = [ 
                                            [p00, p01, p02],
                                            [p10, p11, p12],
                                            [p20, p21, p22]
                                        ]
                                        grid_state = [str(p00), str(p01), str(p02), str(p10), str(p11), str(p12), str(p20), str(p21), str(p22)]
                                        player_count = grid_state.count('1')
                                        opponent_count = grid_state.count('2')
                                        if not game_over(grid, 0) and check_winner(grid, 0)==0 and abs(player_count-opponent_count)<=1:
                                            best_moves = best_move(grid, player=1, opponent=2, players_chance=True, default_value=0, all_best_moves=True)
                                            all_best_moves["".join(grid_state)] = best_moves
    return all_best_moves

all_best_moves = generate_all_possibilities()
write_json('best_moves.json', all_best_moves)