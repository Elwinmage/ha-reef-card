#!/usr/bin/env python3
"""
Translation Keys Verification Script

This script verifies:
1. All i18n._() keys used in code exist in all translation files
2. All keys in translation files are used in the code

Usage:
    python verify_translations.py
"""

import os
import re
import json
from pathlib import Path
from typing import Set, Dict, List, Tuple
from collections import defaultdict

# ANSI color codes
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
BOLD = '\033[1m'
NC = '\033[0m'  # No Color


class TranslationVerifier:
    """Verifies translation key consistency between code and translation files"""
    
    # Keys that are used dynamically (not detected by static analysis)
    # Only day names are truly dynamic (used in loops/variables)
    DYNAMIC_KEYS = {
        'day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7',  # Day names
    }
    
    # Keys to ignore completely (template/placeholder keys)
    IGNORED_KEYS = {
        '<key>',  # Template placeholder key
    }
    
    # Keys that MUST exist in all translation files (critical fallbacks)
    REQUIRED_KEYS = {
        'canNotFindTranslation',  # Critical fallback message when translation not found
    }
    
    def __init__(self, src_dir: str = "src", translations_dir: str = "src/translations/locales"):
        base_path = os.path.dirname(__file__) + "/../"
        self.src_dir = Path(base_path+src_dir)
        self.translations_dir = Path(base_path+translations_dir)
        self.code_keys: Set[str] = set()
        self.translation_keys: Dict[str, Set[str]] = {}
        self.errors: List[str] = []
        self.warnings: List[str] = []
        
    def find_translation_files(self) -> List[Path]:
        """Find all JSON translation files"""
        if not self.translations_dir.exists():
            print(f"{RED}Error: Translation directory not found: {self.translations_dir}{NC}")
            return []
        
        files = list(self.translations_dir.glob("*.json"))
        print(f"{BLUE}Found {len(files)} translation file(s):{NC}")
        for f in files:
            print(f"  - {f.name}")
        print()
        return files
    
    def extract_keys_from_code(self) -> Set[str]:
        """Extract all i18n._() keys from TypeScript files"""
        print(f"{BLUE}Scanning code for translation keys...{NC}")
        
        keys = set()
        files_scanned = 0
        
        # Dictionary to store key locations and context
        self.key_locations: Dict[str, List[Dict]] = defaultdict(list)
        
        # Pattern to match i18n._('key') or i18n._("key")
        pattern_i18n = r"i18n\._\(['\"]([^'\"]+)['\"]\)"
        
        # Pattern to match create_select(shadowRoot, 'id', ['opt1', 'opt2', ...])
        pattern_select_with_array = r"create_select\([^,]+,\s*['\"]([^'\"]+)['\"][^,]*,\s*\[([^\]]+)\]"
        
        # Pattern to match create_select(shadowRoot, 'id', ...) - just ID
        pattern_select_id = r"create_select\([^,]+,\s*['\"]([^'\"]+)['\"]"
        
        # Pattern to match create_hour(shadowRoot, 'id', ...)
        pattern_hour = r"create_hour\([^,]+,\s*['\"]([^'\"]+)['\"]"
        
        # Pattern to match is_checked('id') or is_checked("id")
        # These IDs are element names that appear in config.elements[id]
        pattern_is_checked = r"is_checked\(['\"]([^'\"]+)['\"]\)"
        
        for ts_file in self.src_dir.rglob("*.ts"):
            # Skip .d.ts files
            if ts_file.name.endswith('.d.ts'):
                continue
            
            try:
                content = ts_file.read_text(encoding='utf-8')
                lines = content.split('\n')
                
                # Search in each line
                for line_num, line in enumerate(lines, 1):
                    # 1. Find i18n._() calls
                    matches_i18n = re.finditer(pattern_i18n, line)
                    
                    for match in matches_i18n:
                        key = match.group(1)
                        
                        # Skip ignored keys
                        if key in self.IGNORED_KEYS:
                            continue
                        
                        keys.add(key)
                        
                        # Store location and context
                        context = {
                            'file': str(ts_file.relative_to(self.src_dir)),
                            'line': line_num,
                            'line_before': lines[line_num - 2].strip() if line_num > 1 else '',
                            'line_current': line.strip(),
                            'line_after': lines[line_num].strip() if line_num < len(lines) else '',
                        }
                        self.key_locations[key].append(context)
                    
                    # 2. Find create_select() calls with array literals
                    matches_select_array = re.finditer(pattern_select_with_array, line)
                    
                    for match in matches_select_array:
                        # ID becomes a key (for the label)
                        id_key = match.group(1)
                        keys.add(id_key)
                        
                        # Store location
                        context = {
                            'file': str(ts_file.relative_to(self.src_dir)),
                            'line': line_num,
                            'line_before': lines[line_num - 2].strip() if line_num > 1 else '',
                            'line_current': line.strip(),
                            'line_after': lines[line_num].strip() if line_num < len(lines) else '',
                        }
                        self.key_locations[id_key].append(context)
                        
                        # Options become keys (if translation=true, which is default)
                        options_str = match.group(2)
                        # Extract quoted strings from the array
                        option_keys = re.findall(r"['\"]([^'\"]+)['\"]", options_str)
                        
                        for opt_key in option_keys:
                            keys.add(opt_key)
                            self.key_locations[opt_key].append(context)
                    
                    # 2b. Find create_select() calls without array (just capture ID)
                    # Only if not already matched by pattern_select_with_array
                    if not re.search(pattern_select_with_array, line):
                        matches_select_id = re.finditer(pattern_select_id, line)
                        
                        for match in matches_select_id:
                            # ID becomes a key (for the label)
                            id_key = match.group(1)
                            keys.add(id_key)
                            
                            # Store location
                            context = {
                                'file': str(ts_file.relative_to(self.src_dir)),
                                'line': line_num,
                                'line_before': lines[line_num - 2].strip() if line_num > 1 else '',
                                'line_current': line.strip(),
                                'line_after': lines[line_num].strip() if line_num < len(lines) else '',
                            }
                            self.key_locations[id_key].append(context)
                    
                    # 3. Find create_hour() calls
                    matches_hour = re.finditer(pattern_hour, line)
                    
                    for match in matches_hour:
                        # ID becomes a key (for the label)
                        id_key = match.group(1)
                        keys.add(id_key)
                        
                        # Store location
                        context = {
                            'file': str(ts_file.relative_to(self.src_dir)),
                            'line': line_num,
                            'line_before': lines[line_num - 2].strip() if line_num > 1 else '',
                            'line_current': line.strip(),
                            'line_after': lines[line_num].strip() if line_num < len(lines) else '',
                        }
                        self.key_locations[id_key].append(context)
                    
                    # 4. Find is_checked() calls
                    matches_is_checked = re.finditer(pattern_is_checked, line)
                    
                    for match in matches_is_checked:
                        # ID becomes a key (element name used as translation key)
                        id_key = match.group(1)
                        keys.add(id_key)
                        
                        # Store location
                        context = {
                            'file': str(ts_file.relative_to(self.src_dir)),
                            'line': line_num,
                            'line_before': lines[line_num - 2].strip() if line_num > 1 else '',
                            'line_current': line.strip(),
                            'line_after': lines[line_num].strip() if line_num < len(lines) else '',
                        }
                        self.key_locations[id_key].append(context)
                
                if any(re.search(pattern_i18n, line) or 
                       re.search(pattern_select_with_array, line) or 
                       re.search(pattern_select_id, line) or 
                       re.search(pattern_hour, line) or
                       re.search(pattern_is_checked, line)
                       for line in lines):
                    files_scanned += 1
                    
            except Exception as e:
                self.warnings.append(f"Could not read {ts_file}: {e}")
        
        # Add dynamic keys (used but not detectable by static analysis)
        keys.update(self.DYNAMIC_KEYS)
        
        # Add required keys (must always exist in translation files)
        keys.update(self.REQUIRED_KEYS)
        
        print(f"  Scanned {files_scanned} files with translation calls")
        print(f"  Found {len(keys) - len(self.DYNAMIC_KEYS) - len(self.REQUIRED_KEYS)} unique keys in code")
        print(f"  Added {len(self.DYNAMIC_KEYS)} dynamic keys (used in mappings/runtime)")
        print(f"  Added {len(self.REQUIRED_KEYS)} required keys (critical fallbacks)")
        if self.IGNORED_KEYS:
            print(f"  Ignored {len(self.IGNORED_KEYS)} template key(s): {', '.join(self.IGNORED_KEYS)}")
        print(f"  Total: {len(keys)} keys")
        print()
        
        self.code_keys = keys
        return keys
    
    def load_translation_file(self, file_path: Path) -> Dict[str, str]:
        """Load and parse a JSON translation file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    self.errors.append(f"{file_path.name}: Invalid format (not a JSON object)")
                    return {}
                
                # Filter out ignored keys
                filtered_data = {k: v for k, v in data.items() if k not in self.IGNORED_KEYS}
                
                if len(filtered_data) < len(data):
                    ignored_count = len(data) - len(filtered_data)
                    print(f"  Ignored {ignored_count} template key(s) in {file_path.name}")
                
                return filtered_data
        except json.JSONDecodeError as e:
            self.errors.append(f"{file_path.name}: JSON parsing error: {e}")
            return {}
        except Exception as e:
            self.errors.append(f"{file_path.name}: Could not read file: {e}")
            return {}
    
    def load_all_translations(self) -> Dict[str, Set[str]]:
        """Load all translation files and extract keys"""
        print(f"{BLUE}Loading translation files...{NC}")
        
        translation_files = self.find_translation_files()
        
        for file_path in translation_files:
            lang = file_path.stem  # e.g., 'en' from 'en.json'
            translations = self.load_translation_file(file_path)
            
            if translations:
                self.translation_keys[lang] = set(translations.keys())
                print(f"  {lang}.json: {len(translations)} keys")
        
        print()
        return self.translation_keys
    
    def verify_code_keys_in_translations(self) -> Tuple[Dict[str, List[str]], int]:
        """
        Verify that all keys used in code exist in ALL translation files
        
        Returns:
            Tuple of (missing_keys_by_lang, total_missing_count)
        """
        print(f"{BOLD}{'='*70}{NC}")
        print(f"{BOLD}1. Checking if all code keys exist in translation files{NC}")
        print(f"{BOLD}{'='*70}{NC}")
        print()
        
        missing_by_lang: Dict[str, List[str]] = defaultdict(list)
        
        for lang, trans_keys in self.translation_keys.items():
            missing = sorted(self.code_keys - trans_keys)
            
            if missing:
                missing_by_lang[lang] = missing
                print(f"{RED}✗ {lang}.json is missing {len(missing)} key(s):{NC}")
                
                for key in missing:
                    # Show the key
                    if key in self.REQUIRED_KEYS:
                        print(f"    {RED}✗✗ {key} (REQUIRED - CRITICAL!){NC}")
                    else:
                        print(f"    {RED}✗{NC} {key}")
                    
                    # Show context if available (not for dynamic/required keys)
                    if key in self.key_locations and self.key_locations[key]:
                        locations = self.key_locations[key]
                        
                        # Show first occurrence
                        loc = locations[0]
                        print(f"       {BLUE}Found in:{NC} {loc['file']}:{loc['line']}")
                        
                        # Show context (3 lines)
                        if loc['line_before']:
                            print(f"       {loc['line'] - 1:4d} | {loc['line_before']}")
                        print(f"       {YELLOW}{loc['line']:4d} | {loc['line_current']}{NC}")
                        if loc['line_after']:
                            print(f"       {loc['line'] + 1:4d} | {loc['line_after']}")
                        
                        # Show additional occurrences count
                        if len(locations) > 1:
                            print(f"       {BLUE}(+{len(locations) - 1} more occurrence(s)){NC}")
                        print()
                    elif key in self.DYNAMIC_KEYS:
                        print(f"       {BLUE}(Dynamic key - used in loops/variables){NC}")
                        print()
                    elif key in self.REQUIRED_KEYS:
                        print(f"       {BLUE}(Required key - critical fallback){NC}")
                        print()
                
        total_missing = sum(len(keys) for keys in missing_by_lang.values())
        
        if not missing_by_lang:
            print(f"{GREEN}✓ All keys used in code exist in all translation files{NC}")
        else:
            print(f"{RED}✗ Found {total_missing} missing translation(s) across {len(missing_by_lang)} file(s){NC}")
        
        print()
        return dict(missing_by_lang), total_missing
    
    def verify_translation_keys_in_code(self) -> Tuple[Dict[str, List[str]], int]:
        """
        Verify that all keys in translation files are used in code
        Excludes DYNAMIC_KEYS from unused list
        
        Returns:
            Tuple of (unused_keys_by_lang, total_unused_count)
        """
        print(f"{BOLD}{'='*70}{NC}")
        print(f"{BOLD}2. Checking if all translation keys are used in code{NC}")
        print(f"{BOLD}{'='*70}{NC}")
        print()
        
        unused_by_lang: Dict[str, List[str]] = defaultdict(list)
        
        for lang, trans_keys in self.translation_keys.items():
            # Find unused keys (excluding known dynamic keys)
            unused = sorted(trans_keys - self.code_keys)
            
            if unused:
                unused_by_lang[lang] = unused
                print(f"{YELLOW}⚠ {lang}.json has {len(unused)} unused key(s):{NC}")
                print(f"{YELLOW}  (Not including {len(self.DYNAMIC_KEYS)} known dynamic keys){NC}")
                for key in unused:
                    print(f"    - {key}")
                print()
            else:
                print(f"{GREEN}✓ {lang}.json: All keys are used in code{NC}")
        
        total_unused = sum(len(keys) for keys in unused_by_lang.values())
        
        if not unused_by_lang:
            print(f"{GREEN}✓ All translation keys are used in code{NC}")
        else:
            print(f"{YELLOW}⚠ Found {total_unused} unused translation(s) across {len(unused_by_lang)} file(s){NC}")
            print(f"{YELLOW}  (These keys can be removed or are kept for future use){NC}")
            print(f"{YELLOW}  Dynamic keys ({len(self.DYNAMIC_KEYS)}) are automatically considered as used{NC}")
        
        print()
        return dict(unused_by_lang), total_unused
    
    def check_translation_consistency(self) -> bool:
        """
        Check if all translation files have the same keys
        
        Returns:
            True if all files are consistent, False otherwise
        """
        print(f"{BOLD}{'='*70}{NC}")
        print(f"{BOLD}3. Checking consistency between translation files{NC}")
        print(f"{BOLD}{'='*70}{NC}")
        print()
        
        if len(self.translation_keys) < 2:
            print(f"{YELLOW}⚠ Only one translation file found, skipping consistency check{NC}")
            print()
            return True
        
        # Get all languages
        languages = list(self.translation_keys.keys())
        base_lang = languages[0]
        base_keys = self.translation_keys[base_lang]
        
        print(f"Using {base_lang}.json as reference ({len(base_keys)} keys)")
        print()
        
        all_consistent = True
        
        for lang in languages[1:]:
            lang_keys = self.translation_keys[lang]
            
            # Keys in base but not in this language
            missing = sorted(base_keys - lang_keys)
            # Keys in this language but not in base
            extra = sorted(lang_keys - base_keys)
            
            if missing or extra:
                all_consistent = False
                print(f"{RED}✗ {lang}.json differs from {base_lang}.json:{NC}")
                
                if missing:
                    print(f"  Missing {len(missing)} key(s):")
                    for key in missing[:10]:  # Show first 10
                        print(f"    - {key}")
                    if len(missing) > 10:
                        print(f"    ... and {len(missing) - 10} more")
                
                if extra:
                    print(f"  Extra {len(extra)} key(s):")
                    for key in extra[:10]:  # Show first 10
                        print(f"    + {key}")
                    if len(extra) > 10:
                        print(f"    ... and {len(extra) - 10} more")
                
                print()
            else:
                print(f"{GREEN}✓ {lang}.json: Consistent with {base_lang}.json{NC}")
        
        if all_consistent:
            print(f"{GREEN}✓ All translation files have the same keys{NC}")
        else:
            print(f"{RED}✗ Translation files have inconsistent keys{NC}")
        
        print()
        return all_consistent
    
    def generate_report(self) -> str:
        """Generate a detailed report"""
        report = []
        report.append("=" * 70)
        report.append("TRANSLATION VERIFICATION REPORT")
        report.append("=" * 70)
        report.append("")
        
        # Summary
        report.append("SUMMARY:")
        report.append(f"  Code files scanned: {len(list(self.src_dir.rglob('*.ts')))}")
        report.append(f"  Translation files: {len(self.translation_keys)}")
        report.append(f"  Unique keys in code (static): {len(self.code_keys) - len(self.DYNAMIC_KEYS) - len(self.REQUIRED_KEYS)}")
        report.append(f"  Dynamic keys (protected): {len(self.DYNAMIC_KEYS)}")
        report.append(f"  Required keys (critical): {len(self.REQUIRED_KEYS)}")
        report.append(f"  Total keys expected: {len(self.code_keys)}")
        
        for lang, keys in self.translation_keys.items():
            report.append(f"  Keys in {lang}.json: {len(keys)}")
        
        report.append("")
        
        # Required keys
        report.append("REQUIRED KEYS (Must exist in all files):")
        for key in sorted(self.REQUIRED_KEYS):
            report.append(f"  ✓ {key}")
        report.append("")
        
        # Dynamic keys
        report.append("PROTECTED DYNAMIC KEYS:")
        for key in sorted(self.DYNAMIC_KEYS):
            report.append(f"  - {key}")
        report.append("")
        
        # Code keys
        report.append("KEYS USED IN CODE (Including dynamic and required):")
        for key in sorted(self.code_keys):
            report.append(f"  - {key}")
        
        report.append("")
        
        # Missing keys per language
        report.append("=" * 70)
        report.append("MISSING TRANSLATIONS (Keys in code but not in translation files):")
        report.append("=" * 70)
        report.append("")
        
        has_missing = False
        for lang, trans_keys in self.translation_keys.items():
            missing = sorted(self.code_keys - trans_keys)
            if missing:
                has_missing = True
                report.append(f"{lang}.json is MISSING {len(missing)} key(s):")
                
                for key in missing:
                    if key in self.REQUIRED_KEYS:
                        report.append(f"  ✗✗ {key} (REQUIRED - CRITICAL!)")
                    else:
                        report.append(f"  ✗ {key}")
                    
                    # Add context if available
                    if key in self.key_locations and self.key_locations[key]:
                        locations = self.key_locations[key]
                        
                        # First occurrence
                        loc = locations[0]
                        report.append(f"     Found in: {loc['file']}:{loc['line']}")
                        
                        # Context lines
                        if loc['line_before']:
                            report.append(f"     {loc['line'] - 1:4d} | {loc['line_before']}")
                        report.append(f"  >> {loc['line']:4d} | {loc['line_current']}")
                        if loc['line_after']:
                            report.append(f"     {loc['line'] + 1:4d} | {loc['line_after']}")
                        
                        # Additional occurrences
                        if len(locations) > 1:
                            report.append(f"     (+{len(locations) - 1} more occurrence(s))")
                            for other_loc in locations[1:]:
                                report.append(f"       - {other_loc['file']}:{other_loc['line']}")
                        report.append("")
                    elif key in self.DYNAMIC_KEYS:
                        report.append(f"     (Dynamic key - used in loops/variables)")
                        report.append("")
                    elif key in self.REQUIRED_KEYS:
                        report.append(f"     (Required key - critical fallback)")
                        report.append("")
                
                report.append("")
        
        if not has_missing:
            report.append("✓ All translation files have all required keys")
            report.append("")
        
        # Unused keys per language
        report.append("=" * 70)
        report.append("UNUSED TRANSLATIONS (Keys in files but not used in code):")
        report.append("=" * 70)
        report.append("")
        
        has_unused = False
        for lang, trans_keys in self.translation_keys.items():
            unused = sorted(trans_keys - self.code_keys)
            if unused:
                has_unused = True
                report.append(f"{lang}.json has {len(unused)} UNUSED key(s):")
                report.append(f"  (Not including {len(self.DYNAMIC_KEYS)} protected dynamic keys)")
                report.append(f"  (Not including {len(self.REQUIRED_KEYS)} required critical keys)")
                for key in unused:
                    report.append(f"  - {key}")
                report.append("")
        
        if not has_unused:
            report.append("✓ No unused keys found in translation files")
            report.append("")
        
        # Consistency check
        report.append("=" * 70)
        report.append("CONSISTENCY CHECK:")
        report.append("=" * 70)
        report.append("")
        
        if len(self.translation_keys) >= 2:
            languages = list(self.translation_keys.keys())
            base_lang = languages[0]
            base_keys = self.translation_keys[base_lang]
            
            report.append(f"Using {base_lang}.json as reference ({len(base_keys)} keys)")
            report.append("")
            
            all_consistent = True
            for lang in languages[1:]:
                lang_keys = self.translation_keys[lang]
                missing = sorted(base_keys - lang_keys)
                extra = sorted(lang_keys - base_keys)
                
                if missing or extra:
                    all_consistent = False
                    report.append(f"✗ {lang}.json differs from {base_lang}.json:")
                    
                    if missing:
                        report.append(f"  Missing {len(missing)} key(s):")
                        for key in missing:
                            report.append(f"    - {key}")
                    
                    if extra:
                        report.append(f"  Extra {len(extra)} key(s):")
                        for key in extra:
                            report.append(f"    + {key}")
                    
                    report.append("")
            
            if all_consistent:
                report.append("✓ All translation files have the same keys")
        else:
            report.append("Only one translation file - consistency check skipped")
        
        report.append("")
        report.append("=" * 70)
        report.append("END OF REPORT")
        report.append("=" * 70)
        
        return "\n".join(report)
    
    def save_report(self, filename: str = "translation_report.txt"):
        """Save detailed report to file"""
        report = self.generate_report()
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"{GREEN}✓ Detailed report saved to: {filename}{NC}")
        except Exception as e:
            print(f"{RED}✗ Could not save report: {e}{NC}")
    
    def run(self) -> bool:
        """
        Run full verification process
        
        Returns:
            True if no errors found, False otherwise
        """
        print()
        print(f"{BOLD}{'='*70}{NC}")
        print(f"{BOLD}TRANSLATION KEY VERIFICATION{NC}")
        print(f"{BOLD}{'='*70}{NC}")
        print()
        
        # Step 1: Extract keys from code
        self.extract_keys_from_code()
        
        # Step 2: Load all translations
        self.load_all_translations()
        
        if not self.translation_keys:
            print(f"{RED}✗ No translation files found{NC}")
            return False
        
        # Step 3: Verify code keys in translations
        missing_by_lang, total_missing = self.verify_code_keys_in_translations()
        
        # Step 4: Verify translation keys in code
        unused_by_lang, total_unused = self.verify_translation_keys_in_code()
        
        # Step 5: Check consistency
        is_consistent = self.check_translation_consistency()
        
        # Final summary
        print(f"{BOLD}{'='*70}{NC}")
        print(f"{BOLD}FINAL SUMMARY{NC}")
        print(f"{BOLD}{'='*70}{NC}")
        print()
        
        has_errors = total_missing > 0
        has_warnings = total_unused > 0 or not is_consistent
        
        if has_errors:
            print(f"{RED}✗ ERRORS FOUND:{NC}")
            print(f"  - {total_missing} missing translation(s)")
        else:
            print(f"{GREEN}✓ No errors found{NC}")
        
        print()
        
        if has_warnings:
            print(f"{YELLOW}⚠ WARNINGS:{NC}")
            if total_unused > 0:
                print(f"  - {total_unused} unused translation(s)")
            if not is_consistent:
                print(f"  - Translation files are not consistent")
        else:
            print(f"{GREEN}✓ No warnings{NC}")
        
        print()
        
        # Save detailed report
        self.save_report()
        
        print()
        
        if has_errors:
            print(f"{RED}{'='*70}{NC}")
            print(f"{RED}VERIFICATION FAILED ✗{NC}")
            print(f"{RED}{'='*70}{NC}")
            return False
        else:
            print(f"{GREEN}{'='*70}{NC}")
            print(f"{GREEN}VERIFICATION PASSED ✓{NC}")
            print(f"{GREEN}{'='*70}{NC}")
            return True


def main():
    """Main entry point"""
    verifier = TranslationVerifier()
    success = verifier.run()
    
    # Exit with appropriate code
    exit(0 if success else 1)


if __name__ == '__main__':
    main()
