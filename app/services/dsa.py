def longSubStringAtMostKCharacter(s,k):
    max_len=0
    left=0
    freq=dict()
    for right in range(len(s)):
        char=s[right]
        freq[char]=freq.get(char,0) + 1
        
        while len(freq)>k:
            left_char=s[left]
            freq[left_char]-=1

            if(freq[left_char]==0):
                del freq[left_char]
            left=left+1
        max_len=max(max_len,right-left+1)
    return max_len


def longSubstringWithoutRepeating(s):
    seen=set()
    max_len=0
    left=0
    for right in range(len(s)):
        while s[right] in seen:
            seen.remove(s[left])
            left +=1
        seen.add(s[right])
        max_len=max(max_len,right-left+1)
    return max_len



def minLengthSubArrayWithSum(s,k):
    min_len=len(s)
    left=0
    curr_sum=0
    for right in range(len(s)):
        curr_sum +=s[right]
        while curr_sum >= k :
            min_len=min(right-left+1,min_len)
            curr_sum -=s[left]
            left +=1
    return min_len
