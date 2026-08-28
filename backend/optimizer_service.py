from ortools.sat.python import cp_model
import json

def generate_patterns(item_lengths, stock_length, kerf):
    patterns = []
    
    def search(current_pattern, current_length, item_index):
        if sum(current_pattern) > 0:
            patterns.append(list(current_pattern))
            
        for i in range(item_index, len(item_lengths)):
            length = item_lengths[i]
            new_count = sum(current_pattern) + 1
            added_length = length if new_count == 1 else length + kerf
            
            if current_length + added_length <= stock_length:
                current_pattern[i] += 1
                search(current_pattern, current_length + added_length, i)
                current_pattern[i] -= 1

    initial_pattern = [0] * len(item_lengths)
    search(initial_pattern, 0, 0)
    return patterns

def filter_maximal_patterns(patterns, item_lengths, stock_length, kerf):
    maximal_patterns = []
    min_item = min(item_lengths)
    
    for p in patterns:
        pieces_count = sum(p)
        pattern_len = sum(p[i] * item_lengths[i] for i in range(len(item_lengths)))
        total_len = pattern_len + (pieces_count - 1) * kerf
        waste = stock_length - total_len
        
        if waste < (min_item + kerf):
            maximal_patterns.append(p)
            
    return maximal_patterns

def run_optimization(demands: dict, stock_length: float, kerf: float = 3.0):
    item_lengths = list(demands.keys())
    item_quantities = list(demands.values())
    
    all_patterns = generate_patterns(item_lengths, stock_length, kerf)
    patterns = filter_maximal_patterns(all_patterns, item_lengths, stock_length, kerf)
    
    model = cp_model.CpModel()
    max_stock_needed = sum(item_quantities)
    
    x = []
    for i in range(len(patterns)):
        x.append(model.NewIntVar(0, max_stock_needed, f'pattern_{i}'))
        
    for i, qty in enumerate(item_quantities):
        model.Add(sum(p[i] * x[j] for j, p in enumerate(patterns)) >= qty)
        
    model.Minimize(sum(x))
    
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 15.0
    status = solver.Solve(model)
    
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        result_patterns = []
        total_used_length = 0.0
        total_waste = 0.0
        total_stock = int(solver.ObjectiveValue())
        
        for j, count in enumerate(x):
            val = solver.Value(count)
            if val > 0:
                pattern = patterns[j]
                cuts = []
                pattern_length_sum = 0
                pieces_count = 0
                for i, amount in enumerate(pattern):
                    if amount > 0:
                        cuts.extend([item_lengths[i]] * amount)
                        pattern_length_sum += item_lengths[i] * amount
                        pieces_count += amount
                        
                waste = stock_length - (pattern_length_sum + (pieces_count - 1) * kerf)
                total_waste += waste * val
                total_used_length += stock_length * val
                
                result_patterns.append({
                    "usage_count": val,
                    "waste": float(waste),
                    "cuts": cuts
                })
                
        waste_percentage = (total_waste / total_used_length) * 100 if total_used_length > 0 else 0
        
        return {
            "success": True,
            "stock_length": stock_length,
            "kerf": kerf,
            "total_stock_used": total_stock,
            "total_waste": float(total_waste),
            "waste_percentage": float(waste_percentage),
            "patterns": result_patterns
        }
    else:
        return {"success": False, "message": "Optimal çözüm bulunamadı."}
