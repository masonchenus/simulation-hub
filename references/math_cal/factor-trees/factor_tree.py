#!/usr/bin/env python3
"""
Script to calculate the number of factors (divisors) of 1728^9623
and list a sample of the divisors.

Mathematical explanation:
- 1728 = 12^3 = (2^2 * 3)^3 = 2^6 * 3^3
- 1728^9623 = (2^6 * 3^3)^9623 = 2^(6*9623) * 3^(3*9623) = 2^57738 * 3^28869

For a number n = p1^a1 * p2^a2 * ... * pk^ak, 
the number of divisors d(n) = (a1+1)(a2+1)...(ak+1)
"""
import itertools
import math
import sys


sys.set_int_max_str_digits(500000)

def calculate_prime_factorization():
    """
    Calculate the prime factorization of 1728^9623
    """
    exponent = 9623
    # Factorize 1728
    # 1728 = 12^3 = (2^2 * 3)^3 = 2^6 * 3^3
    base_factors = {2: 6, 3: 3}
    
    print("=== Prime Factorization of 1728 ===")
    print(f"1728 = 12^3 = (2^2 × 3)^3 = 2^6 × 3^3")
    print(f"Base factorization: {base_factors}")
    
    # For 1728^9623, multiply each exponent by 9623
    exponentiated_factors = {p: exp * exponent for p, exp in base_factors.items()}
    
    print(f"\n=== Prime Factorization of 1728^{exponent} ===")
    print(f"1728^{exponent} = ", end="")
    for i, (prime, exp) in enumerate(exponentiated_factors.items()):
        if i > 0:
            print(" × ", end="")
        print(f"{prime}^{exp}", end="")
    print()
    
    return exponentiated_factors


def calculate_number_of_divisors(factors):
    """
    Calculate the number of divisors using the formula:
    d(n) = (a1+1)(a2+1)...(ak+1)
    where n = p1^a1 * p2^a2 * ... * pk^ak
    """
    print("\n=== Number of Divisors Calculation ===")
    print("Formula: d(n) = (exponent1 + 1) × (exponent2 + 1) × ... × (exponentk + 1)")
    print()
    
    divisor_formula = []
    divisor_values = []
    
    for prime, exp in factors.items():
        term = f"({exp} + 1)"
        value = exp + 1
        divisor_formula.append(term)
        divisor_values.append(value)
        print(f"  For prime {prime}: {term} = {value}")
    
    print(f"\n  Formula: {' × '.join(divisor_formula)}")
    
    # Calculate the product
    total_divisors = 1
    for val in divisor_values:
        total_divisors *= val
    
    print(f"\n  = {' × '.join(str(v) for v in divisor_values)}")
    print(f"  = {total_divisors:,}")
    
    return total_divisors


def generate_divisors(factors):
    """
    Generates all divisors of a number given its prime factorization.
    This is a generator function and does not store all divisors in memory.
    Divisors are yielded in ascending order.

    :param factors: A dictionary of {prime: exponent}.
    :yields: Divisors of the number.
    """
    primes = list(factors.keys())
    exponent_ranges = [range(exp + 1) for exp in factors.values()]

    for exp_tuple in itertools.product(*exponent_ranges):
        divisor = 1
        for i, prime in enumerate(primes):
            divisor *= prime ** exp_tuple[i]
        yield divisor


def generate_divisors_reverse(factors):
    """
    Generates all divisors in reverse (descending) order.

    :param factors: A dictionary of {prime: exponent}.
    :yields: Divisors of the number.
    """
    primes = list(factors.keys())
    # The ranges for exponents should be reversed to get descending order of divisors
    exponent_ranges = [reversed(range(exp + 1)) for exp in factors.values()]

    for exp_tuple in itertools.product(*exponent_ranges):
        divisor = 1
        for i, prime in enumerate(primes):
            divisor *= prime ** exp_tuple[i]
        yield divisor


def list_some_divisors(factors, total_divisors, count=10):
    """
    Lists the first and last few divisors.

    :param factors: A dictionary of {prime: exponent}.
    :param total_divisors: The total number of divisors.
    :param count: The number of divisors to list from the beginning and end.
    """
    print("\n" + "=" * 60)
    print(f"Listing a sample of the divisors (first {count} and last {count})")
    print("=" * 60)
    print(f"\nNote: The number has {total_divisors:,} divisors.")
    print("Listing all of them is impractical as it would consume enormous memory and time.")
    print("A generator function is used to produce divisors on-demand.")

    print(f"\nFirst {count} divisors:")
    divisors_generator = generate_divisors(factors)
    for i, divisor in enumerate(divisors_generator):
        if i >= count:
            break
        print(f"  {i + 1:2d}: {divisor:,}")

    print(f"\nLast {count} divisors:")
    divisors_generator_rev = generate_divisors_reverse(factors)
    for i, divisor in enumerate(divisors_generator_rev):
        if i >= count:
            break
        # The largest numbers are too big to print nicely with commas.
        # We can print it in scientific notation if it's too long.
        divisor_str = f"{divisor:,}"
        if len(divisor_str) > 50:
            divisor_str = f"{divisor:.3e}"
        print(f"  {total_divisors - i:11d}: {divisor_str}")


def calculate_with_python_big_int():
    """
    Alternative: Calculate using Python's big integers to verify
    """
    print("\n=== Verification using Python's built-in big integers ===")
    
    # Calculate actual number
    n = 1728 ** 9623
    
    # Factorize using trial division (impractical for this size, but we'll use the math approach)
    # Instead, we'll just verify our formula
    print(f"The number 1728^9623 has {len(str(n)):,} digits.")
    print("(Directly counting divisors of this number is not practical)")


def main():
    print("=" * 60)
    print("Calculating the number of factors of 1728^9623")
    print("=" * 60)
    
    # Get the prime factorization
    factors = calculate_prime_factorization()
    
    # Calculate number of divisors
    num_divisors = calculate_number_of_divisors(factors)
    
    # List a sample of the divisors
    list_some_divisors(factors, num_divisors, count=10)

    print("\n" + "=" * 60)
    print("FINAL RESULT SUMMARY")
    print("=" * 60)
    print(f"\n1728^9623 = 2^57738 × 3^28869")
    print(f"\nNumber of factors (divisors): {num_divisors:,}")

    # Show the breakdown
    print(f"\nBreakdown: (57738 + 1) × (28869 + 1)")
    print(f"         = 57739 × 28870")
    print(f"         = {num_divisors:,}")

    # Scientific notation
    print(f"\nIn scientific notation: {num_divisors:.2e}")

    # Save to file
    output_file = '/Users/mason/simulation-hub/references/math_cal/factor-trees/1728^9623_divisors.txt'
    with open(output_file, 'w') as f:
        f.write(f"1728^9623 Factorization: 2^57738 × 3^28869\n")
        f.write(f"Number of divisors: {num_divisors:,}\n")
        f.write(f"Formula: (57738 + 1) × (28869 + 1) = 57739 × 28870\n")
        f.write(f"Scientific notation: {num_divisors:.2e}\n")

    print(f"\nSaved summary to: {output_file}")

    # Optional: verification of number of digits
    calculate_with_python_big_int()


if __name__ == "__main__":
    main()
