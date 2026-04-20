import { NextRequest, NextResponse } from 'next/server';

async function getWeather(city: string) {
  try {
    const url = `https://wttr.in/${city}?format=j1`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    const temp = data.current_condition[0].temp_C;
    const desc = data.current_condition[0].weatherDesc[0].value;

    return {
      city: city,
      temp: temp,
      desc: desc
    };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'London';

  const result = await getWeather(city);

  return NextResponse.json(result);
}