# Audio metatag writer
This stuff is using on [Musicder](https://musicder.t-ps.net/)


### Example payload to `/id3` (POST)
```
{
    "song_url":"https://aac.saavncdn.com/622/c1a0e6f34388089a4c52c1026bee0831_160.mp4",
    "cover_url":"https://c.saavncdn.com/622/Drive-Hindi-2019-20191014095305-500x500.jpg",
    "name":"Makhna",
    "album":"Drive",
    "year":2019,
    "artist":"Tanishk Bagchi, Asees Kaur, Yasser Desai"
}
```

### Environment variables

- `APP_URL`
- `PORT`

### Deploy

Please learn about `Docker` 🤷‍♂

### Credits

Thanks to [Sumanjay](https://github.com/cyberboysumanjay) for `mutagen` suggestion.

### Note

I'm not a python dev. I used python because there are no way (atleast IDK) instead of using ffmpeg if I use node, and that is very resources consuming. So Sumanjay Bhai suggest me to use mutagen and I used it. Fell free to optimize my noob code. Thank you !
