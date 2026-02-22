#!/usr/bin/env python3
"""
Factor Tree Calculator
Calculates and visualizes the prime factorization of a number as a tree structure.
"""

from typing import Optional
from dataclasses import dataclass


@dataclass
class TreeNode:
    """Represents a node in the factor tree."""
    value: int
    is_prime: bool
    children: list['TreeNode']


def is_prime(n: int) -> bool:
    """Check if a number is prime."""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n ** 0.5) + 1, 2):
        if n % i == 0:
            return False
    return True


def get_smallest_prime_factor(n: int) -> Optional[int]:
    """Get the smallest prime factor of a number."""
    if n < 2:
        return None
    if n % 2 == 0:
        return 2
    for i in range(3, int(n ** 0.5) + 1, 2):
        if n % i == 0:
            return i
    return n


def build_factor_tree(n: int) -> Optional[TreeNode]:
    """Build a factor tree recursively for a number."""
    if n < 2:
        return None
    
    node = TreeNode(
        value=n,
        is_prime=is_prime(n),
        children=[]
    )
    
    if node.is_prime:
        return node
    
    factor = get_smallest_prime_factor(n)
    other_factor = n // factor
    
    node.children.append(build_factor_tree(factor))
    node.children.append(build_factor_tree(other_factor))
    
    return node


def extract_prime_factors(node: TreeNode) -> list[int]:
    """Extract all prime factors from the tree."""
    factors = []
    
    if node.is_prime:
        factors.append(node.value)
    else:
        for child in node.children:
            factors.extend(extract_prime_factors(child))
    
    return factors


def render_tree_ascii(node: TreeNode, prefix: str = "", is_last: bool = True, is_root: bool = True) -> str:
    """Render the factor tree as ASCII art."""
    if node is None:
        return ""
    
    lines = []
    connector = "└── " if is_last else "├── "
    
    if not is_root:
        lines.append(f"{prefix}{connector}{node.value} {'(prime)' if node.is_prime else ''}")
        new_prefix = prefix + ("    " if is_last else "│   ")
    else:
        lines.append(f"{node.value} {'(prime)' if node.is_prime else '(original)'}")
        new_prefix = ""
    
    for i, child in enumerate(node.children):
        is_last_child = (i == len(node.children) - 1)
        lines.append(render_tree_ascii(child, new_prefix, is_last_child, False))
    
    return "\n".join(lines)


def save_factor_tree(number: int, filepath: str = "factor_tree.txt") -> str:
    """
    Calculate and save the factor tree of a number to a file.
    
    Args:
        number: The number to factorize
        filepath: Path to save the result
    
    Returns:
        The string representation of the factor tree
    """
    if number < 2:
        raise ValueError("Number must be >= 2")
    
    tree = build_factor_tree(number)
    factors = extract_prime_factors(tree)
    unique_factors = sorted(set(factors))
    
    # Build output
    output_lines = []
    output_lines.append("=" * 50)
    output_lines.append("FACTOR TREE CALCULATOR")
    output_lines.append("=" * 50)
    output_lines.append(f"\nNumber: {number}")
    output_lines.append(f"Prime Factors: {' × '.join(map(str, sorted(factors)))}")
    output_lines.append(f"Unique Prime Factors: {', '.join(map(str, unique_factors))}")
    output_lines.append(f"\nFactor Tree Structure:")
    output_lines.append("-" * 50)
    output_lines.append(render_tree_ascii(tree))
    output_lines.append("-" * 50)
    
    output = "\n".join(output_lines)
    
    # Save to file
    with open(filepath, 'w') as f:
        f.write(output)
    
    return output


def print_factor_tree(number: int) -> str:
    """
    Calculate and print the factor tree of a number.
    
    Args:
        number: The number to factorize
    
    Returns:
        The string representation of the factor tree
    """
    if number < 2:
        raise ValueError("Number must be >= 2")
    
    tree = build_factor_tree(number)
    factors = extract_prime_factors(tree)
    unique_factors = sorted(set(factors))
    
    print("=" * 50)
    print("FACTOR TREE CALCULATOR")
    print("=" * 50)
    print(f"\nNumber: {number}")
    print(f"Prime Factors: {' × '.join(map(str, sorted(factors)))}")
    print(f"Unique Prime Factors: {', '.join(map(str, unique_factors))}")
    print(f"\nFactor Tree Structure:")
    print("-" * 50)
    print(render_tree_ascii(tree))
    print("-" * 50)
    
    return render_tree_ascii(tree)


def main():
    """Main function to run the factor tree calculator."""
    import sys
    
    if len(sys.argv) > 1:
        try:
            number = int(sys.argv[1])
        except ValueError:
            print("Error: Please provide a valid integer")
            sys.exit(1)
    else:
        # Interactive mode
        while True:
            try:
                user_input = input("Enter a positive integer (or 'q' to quit): ").strip()
                if user_input.lower() == 'q':
                    break
                number = int(user_input)
                if number < 2:
                    print("Please enter a number >= 2")
                    continue
                print_factor_tree(number)
                
                # Ask to save
                save = input("Save to file? (y/n): ").strip().lower()
                if save == 'y':
                    filepath = input("Enter filename (default: factor_tree.txt): ").strip()
                    if not filepath:
                        filepath = "factor_tree.txt"
                    save_factor_tree(number, filepath)
                    print(f"Saved to {filepath}")
            except ValueError as e:
                print(f"Error: {e}")
            except EOFError:
                break
    
    # Example usage if run with argument
    if len(sys.argv) > 1:
        number = int(sys.argv[1])
        print_factor_tree(number)
        
        # Also save to the references directory
        try:
            output_path = "references/math_cal/factor-trees/factor_tree.txt"
            save_factor_tree(number, output_path)
            print(f"\nAlso saved to {output_path}")
        except Exception as e:
            print(f"Note: Could not save to references directory: {e}")


if __name__ == "__main__":
    main()

