#news
cd news
python generate_news.py
#cd ../../web-app
#npm run build
#npm run deploy
cd ..

#approval ratings
cd approval_ratings
curl https://static.dwcdn.net/data/vknzT.csv?v=0 > polls.csv
python approval_polling.py
cd ..

#sports elos
cd sports_elos
python populate_data.py
cd ..
