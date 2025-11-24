#!/usr/bin/env python3
"""
gitignore에 지정된 파일들만 압축하는 스크립트
"""
#pip install pathspec
#python backup_ignored_files.py
import os
import zipfile
import pathspec
from pathlib import Path
from datetime import datetime

def read_gitignore(gitignore_path):
    """
    .gitignore 파일을 읽어서 pathspec 패턴으로 변환
    """
    if not os.path.exists(gitignore_path):
        print(f"Warning: {gitignore_path} not found")
        return None
    
    try:
        with open(gitignore_path, 'r', encoding='utf-8') as f:
            patterns = f.read().splitlines()
    except Exception as e:
        print(f"Error reading .gitignore: {e}")
        try:
            with open(gitignore_path, 'r', encoding='cp949') as f:
                patterns = f.read().splitlines()
        except Exception as e2:
            print(f"Error reading .gitignore with cp949: {e2}")
            return None
    
    # 빈 줄과 주석 제거
    patterns = [p.strip() for p in patterns if p.strip() and not p.strip().startswith('#')]
    
    return pathspec.PathSpec.from_lines('gitwildmatch', patterns)

def get_ignored_files(root_dir, gitignore_spec):
    
    ignored_files = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # 상대 경로로 변환
        rel_dir = os.path.relpath(dirpath, root_dir)
        
        # .git 폴더와 node_modules 폴더는 건너뛰기
        if '.git' in dirpath.split(os.sep) or 'node_modules' in dirpath.split(os.sep):
            continue
        
        # 디렉토리 체크
        dirs_to_remove = []
        for dirname in dirnames:
            # node_modules는 항상 제외
            if dirname == 'node_modules':
                dirs_to_remove.append(dirname)
                continue
                
            rel_path = os.path.join(rel_dir, dirname)
            if rel_dir == '.':
                rel_path = dirname
            
            # gitignore 패턴과 매칭되는지 확인
            if gitignore_spec and gitignore_spec.match_file(rel_path):
                dirs_to_remove.append(dirname)
                # 매칭된 디렉토리의 모든 파일 추가
                dir_full_path = os.path.join(dirpath, dirname)
                for root, _, files in os.walk(dir_full_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        ignored_files.append(file_path)
        
        # 이미 처리한 디렉토리는 더 이상 탐색하지 않음
        for dirname in dirs_to_remove:
            dirnames.remove(dirname)
        
        # 파일 체크
        for filename in filenames:
            rel_path = os.path.join(rel_dir, filename)
            if rel_dir == '.':
                rel_path = filename
            
            # gitignore 패턴과 매칭되는지 확인
            if gitignore_spec and gitignore_spec.match_file(rel_path):
                file_path = os.path.join(dirpath, filename)
                ignored_files.append(file_path)
    
    return ignored_files

def create_backup_zip(root_dir, ignored_files, output_path):
    """
    무시된 파일들을 압축 파일로 생성
    """
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in ignored_files:
            # 압축 파일 내부 경로 (프로젝트 루트 기준 상대 경로)
            arcname = os.path.relpath(file_path, root_dir)
            
            try:
                zipf.write(file_path, arcname)
                print(f"Added: {arcname}")
            except Exception as e:
                print(f"Error adding {arcname}: {e}")

def main():
    # 프로젝트 루트 디렉토리
    project_root = os.path.dirname(os.path.abspath(__file__))
    
    # .gitignore 파일 경로
    gitignore_path = os.path.join(project_root, '.gitignore')
    
    # .gitignore 읽기
    print("Reading .gitignore...")
    gitignore_spec = read_gitignore(gitignore_path)
    
    if not gitignore_spec:
        print("No gitignore patterns found. Exiting.")
        return
    
    # gitignore에 매칭되는 파일 찾기
    print("\nSearching for ignored files...")
    ignored_files = get_ignored_files(project_root, gitignore_spec)
    
    if not ignored_files:
        print("No ignored files found.")
        return
    
    print(f"\nFound {len(ignored_files)} ignored files/directories")
    
    # 출력 파일명 (타임스탬프 포함)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"ignored_files_backup_{timestamp}.zip"
    output_path = os.path.join(project_root, output_filename)
    
    # 압축 파일 생성
    print(f"\nCreating backup: {output_filename}")
    create_backup_zip(project_root, ignored_files, output_path)
    
    # 결과 출력
    file_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
    print(f"\n✅ Backup completed!")
    print(f"📦 Output: {output_path}")
    print(f"📊 Size: {file_size:.2f} MB")
    print(f"📁 Files: {len(ignored_files)}")

if __name__ == "__main__":
    try:
        import pathspec
    except ImportError:
        print("Error: 'pathspec' module not found.")
        print("Please install it using: pip install pathspec")
        exit(1)
    
    main()
