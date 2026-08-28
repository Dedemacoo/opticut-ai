import pandas as pd
from ortools.sat.python import cp_model
import time

def generate_patterns(item_lengths, stock_length, kerf):
    """
    Verilen parça uzunlukları için stok boyuna sığabilecek tüm 
    geçerli kesim desenlerini (pattern) üretir.
    """
    patterns = []
    
    def search(current_pattern, current_length, item_index):
        # Eğer desen boş değilse kaydet
        if sum(current_pattern) > 0:
            patterns.append(list(current_pattern))
            
        for i in range(item_index, len(item_lengths)):
            length = item_lengths[i]
            # Yeni eklenecek parçanın toplam uzunluğu hesaplanır.
            # İlk parça değilse kerf (bıçak payı) eklenir.
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
    """
    Sadece 'maximal' desenleri (daha fazla parça eklenemeyen veya firenin
    en küçük parçadan bile az olduğu desenleri) filtreler.
    Bu, solver'ın (çözücünün) hızını inanılmaz derecede artırır.
    """
    maximal_patterns = []
    min_item = min(item_lengths)
    
    for p in patterns:
        pieces_count = sum(p)
        pattern_len = sum(p[i] * item_lengths[i] for i in range(len(item_lengths)))
        total_len = pattern_len + (pieces_count - 1) * kerf
        waste = stock_length - total_len
        
        # Eğer kalan fireye en küçük parça bile (kerf ile birlikte) sığmıyorsa bu maximal bir desendir
        if waste < (min_item + kerf):
            maximal_patterns.append(p)
            
    return maximal_patterns

def solve_cutting_stock(demands, stock_length, kerf=3):
    start_time = time.time()
    print("--- 1D Kesim Optimizasyonu Başlıyor ---")
    
    item_lengths = list(demands.keys())
    item_quantities = list(demands.values())
    
    print(f"Stok Boyu: {stock_length} mm, Kerf (Bıçak Payı): {kerf} mm")
    print(f"Siparişler: {demands}")
    
    print("Olası kesim desenleri (patterns) üretiliyor...")
    all_patterns = generate_patterns(item_lengths, stock_length, kerf)
    print(f"Tüm geçerli desenler: {len(all_patterns)} adet.")
    
    patterns = filter_maximal_patterns(all_patterns, item_lengths, stock_length, kerf)
    print(f"Maximal desenler (Optimizasyona girecek olanlar): {len(patterns)} adet.")
    
    # CP-SAT Modeli
    model = cp_model.CpModel()
    
    # Değişkenler: Her desenden kaç adet kullanılacak?
    max_stock_needed = sum(item_quantities) 
    x = []
    for i in range(len(patterns)):
        x.append(model.NewIntVar(0, max_stock_needed, f'pattern_{i}'))
        
    # Kısıtlamalar: Her parça tipi için istenen adeti sağlamalıyız.
    for i, qty in enumerate(item_quantities):
        model.Add(sum(p[i] * x[j] for j, p in enumerate(patterns)) >= qty)
        
    # Hedef Fonksiyonu: Kullanılan toplam stok sayısını (pattern kullanımlarını) minimize et.
    model.Minimize(sum(x))
    
    # Çözücü
    solver = cp_model.CpSolver()
    # Zaman sınırı
    solver.parameters.max_time_in_seconds = 15.0
    
    print("Optimizasyon çözücü çalışıyor (CP-SAT)...")
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        total_stock = int(solver.ObjectiveValue())
        print(f"\n=== OPTİMİZASYON SONUCU ({time.time() - start_time:.2f} saniye) ===")
        print(f"Durum: {'OPTİMAL (Mükemmel Çözüm)' if status == cp_model.OPTIMAL else 'UYGUN ÇÖZÜM BULUNDU'}")
        print(f"Kullanılan Toplam Stok (Profil) Sayısı: {total_stock}")
        
        total_used_length = 0
        total_waste = 0
        
        print("\nKesim Listesi (Operatör İçin):")
        pattern_id = 1
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
                
                print(f"[{val} Adet Profil] -> Kesimler: {cuts} | Kalan Fire: {waste} mm")
                pattern_id += 1
                
        waste_percentage = (total_waste / total_used_length) * 100
        print(f"\n--- ÖZET RAPOR ---")
        print(f"Toplam Kullanılan Malzeme: {total_used_length} mm ({total_used_length/1000} metre)")
        print(f"Toplam Fire: {total_waste} mm")
        print(f"Fire Oranı: %{waste_percentage:.2f}")
        
    else:
        print("Optimum çözüm bulunamadı.")

if __name__ == "__main__":
    # Kullanıcının verdiği örnek veriler
    sample_demands = {
        1400: 66,
        1420: 72,
        1500: 22,
        2000: 24,
        2060: 24,
        2500: 22,
        2530: 2
    }
    stock = 6000
    kerf_thickness = 3
    
    solve_cutting_stock(sample_demands, stock, kerf_thickness)
